"use client";

import { useState } from "react";
import {
  Activity,
  CreditCard,
  DollarSign,
  Users,
  Briefcase,
  Calendar,
  BrainCircuit,
  TrendingUp,
  UserCheck,
  Loader2,
  AlertTriangle,
  Mail,
  Phone,
  MessageSquare,
  PlusCircle,
  Edit,
  MessageCircleQuestion,
  CheckCircle2,
  Trash2,
  AlignCenter,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import type { Case, Dca, TimetableEntry } from "@/lib/types";
import { prioritizeCases } from "@/ai/flows/prioritize-cases";
import { analyzeDcaPerformance } from "@/ai/flows/analyze-dca-performance";
import { useToast } from "@/hooks/use-toast";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  LabelList,
} from "recharts";
import { format, differenceInDays } from "date-fns";
import { useAppContext } from "@/context/app-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

type PriorityResult = {
  priorityScore: number;
  priorityReason: string;
};

type DcaAnalysisResult = {
  analysisSummary: string;
  recommendedAssignments: string;
};

const newCaseSchema = z.object({
  debtorName: z.string().min(1, "Debtor name is required"),
  invoiceNo: z.string().min(1, "Invoice number is required"),
  dueAmount: z.coerce.number().min(1, "Due amount must be positive"),
  dueDate: z.string().min(1, "Due date is required"),
  hasOverdueHistory: z.coerce.number().min(0),
});

type NewCaseForm = z.infer<typeof newCaseSchema>;

const newDcaSchema = z.object({
  name: z.string().min(1, "DCA name is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type NewDcaForm = z.infer<typeof newDcaSchema>;

const timetableSchema = z.object({
  task: z.string().min(1, "Task description is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  dcaId: z.string().min(1, "You must assign a DCA"),
});

type TimetableForm = z.infer<typeof timetableSchema>;


export default function AdminDashboard() {
  const { toast } = useToast();
  const { cases, dcas, timetable, addCase, updateCase, addDca, updateTimetableEntry, addTimetableEntry, removeDca, removeTimetableEntry } = useAppContext();
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [selectedDca, setSelectedDca] = useState<Dca | null>(null);
  const [selectedTimetableEntry, setSelectedTimetableEntry] = useState<TimetableEntry | null>(null);

  const [priorityResult, setPriorityResult] = useState<PriorityResult | null>(
    null
  );
  const [dcaAnalysisResult, setDcaAnalysisResult] =
    useState<DcaAnalysisResult | null>(null);
  const [isPrioritizing, setIsPrioritizing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [assignedDca, setAssignedDca] = useState<string | null>(null);
  const [isAddCaseOpen, setIsAddCaseOpen] = useState(false);
  const [isAddDcaOpen, setIsAddDcaOpen] = useState(false);
  const [isEditTimetableOpen, setIsEditTimetableOpen] = useState(false);
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);

  const newCaseForm = useForm<NewCaseForm>({
    resolver: zodResolver(newCaseSchema),
    defaultValues: {
      hasOverdueHistory: 0,
    },
  });

  const newDcaForm = useForm<NewDcaForm>({
    resolver: zodResolver(newDcaSchema),
  });

  const timetableForm = useForm<TimetableForm>({
    resolver: zodResolver(timetableSchema),
  });

  const totalDue = cases.reduce((sum, c) => sum + c.dueAmount, 0);
  const overdueCases = cases.filter(
    (c) => c.status === "In Progress" || c.status === "Defaulted"
  ).length;

  const solvedCasesCount = cases.filter(c => c.status === 'Paid').length;
  const assignedCasesCount = cases.filter(c => c.assignedDcaId && c.status !== 'Paid').length;
  const notAssignedCasesCount = cases.filter(c => !c.assignedDcaId).length;

  const chartData = [
    { name: "Assigned", value: assignedCasesCount },
    { name: "Not Assigned", value: notAssignedCasesCount },
    { name: "Solved", value: solvedCasesCount },
  ];

  const unresolvedCases = cases.filter(c => !c.feedback);
  const respondedCases = cases.filter(c => !!c.feedback && c.status !== 'Paid' && c.status !== 'Defaulted');

  const handlePrioritize = async () => {
    if (!selectedCase) return;
    setIsPrioritizing(true);
    setPriorityResult(null);
    try {
      const result = await prioritizeCases({
        overdueAging: selectedCase.overdueAging,
        dueAmount: selectedCase.dueAmount,
        recoveryRate: selectedCase.recoveryRate,
        hasOverdueHistory: selectedCase.hasOverdueHistory,
      });
      setPriorityResult(result);
      // Update the case in context
      updateCase(selectedCase.id, { priorityScore: result.priorityScore });
    } catch (error) {
      console.error("Prioritization failed:", error);
      toast({
        variant: "destructive",
        title: "AI Prioritization Failed",
        description: "Could not get priority score. Please try again.",
      });
    } finally {
      setIsPrioritizing(false);
    }
  };

  const handleAnalyzeDca = async () => {
    if (!selectedDca) return;
    setIsAnalyzing(true);
    setDcaAnalysisResult(null);
    try {
      const result = await analyzeDcaPerformance({
        dcaId: selectedDca.id,
        caseHistory: selectedDca.caseHistory,
      });
      setDcaAnalysisResult(result);
    } catch (error) {
      console.error("DCA Analysis failed:", error);
      toast({
        variant: "destructive",
        title: "AI Analysis Failed",
        description: "Could not analyze DCA performance. Please try again.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAssignDCA = () => {
    if (selectedCase && assignedDca) {
      updateCase(selectedCase.id, { assignedDcaId: assignedDca });
      toast({
        title: "Case Assigned",
        description: `${selectedCase.debtorName}'s case has been assigned to ${dcas.find(d => d.id === assignedDca)?.name}.`,
      });
    }
  }

  const handleAddCase = (data: NewCaseForm) => {
    const overdueAging = differenceInDays(new Date(), new Date(data.dueDate));
    const newCase: Case = {
      id: `case-${Date.now()}`,
      status: 'Pending',
      priorityScore: null,
      assignedDcaId: null,
      overdueAging: overdueAging > 0 ? overdueAging : 0,
      recoveryRate: 0.8,
      communicationHistory: 'No contact made yet.',
      ...data,
    };
    addCase(newCase);

    toast({
      title: "Case Created",
      description: `New case for ${data.debtorName} has been added.`,
    });
    newCaseForm.reset();
    setIsAddCaseOpen(false);
  }

  const handleAddDca = (data: NewDcaForm) => {
    const newDca: Dca = {
      id: `dca-${Date.now()}`,
      caseCount: 0,
      recoveryRate: 0,
      caseHistory: 'New agent.',
      ...data,
    };
    addDca(newDca);
    toast({
      title: "DCA Added",
      description: `New agent ${data.name} has been added.`,
    });
    newDcaForm.reset();
    setIsAddDcaOpen(false);
  }

  const handleRemoveDca = (dcaId: string, dcaName: string) => {
    removeDca(dcaId);
    toast({
      title: "DCA Removed",
      description: `Agent ${dcaName} has been removed. Their cases are now unassigned.`,
    });
  }

  const handleEditTimetable = (data: TimetableForm) => {
    if (selectedTimetableEntry) {
      updateTimetableEntry(selectedTimetableEntry.id, data);
      toast({
        title: "Timetable Updated",
        description: "The task has been successfully updated.",
      });
      setIsEditTimetableOpen(false);
    }
  };

  const handleAddSchedule = (data: TimetableForm) => {
    const newEntry: TimetableEntry = {
      id: `task-${Date.now()}`,
      ...data
    };
    addTimetableEntry(newEntry);
    toast({
      title: "Task Scheduled",
      description: `New task "${data.task}" has been scheduled.`,
    });
    timetableForm.reset();
    setIsAddScheduleOpen(false);
  };

  const handleRemoveSchedule = (entryId: string, taskName: string) => {
    removeTimetableEntry(entryId);
    toast({
      title: "Task Removed",
      description: `Task "${taskName}" has been removed from the timetable.`,
    });
  };


  const openEditTimetableDialog = (entry: TimetableEntry) => {
    setSelectedTimetableEntry(entry);
    timetableForm.reset({
      task: entry.task,
      date: entry.date,
      time: entry.time,
      dcaId: entry.dcaId,
    });
    setIsEditTimetableOpen(true);
  };

  const handleMarkAsPaid = (caseId: string) => {
    updateCase(caseId, { status: 'Paid' });
    toast({
      title: "Case Updated",
      description: "The case has been marked as Paid.",
    });
  };


  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Premium Header with Decorative Elements */}
      <div className="relative p-6 bg-gradient-to-br from-black/40 via-black/30 to-black/20 border border-white/10 rounded-2xl backdrop-blur-md shadow-2xl overflow-hidden">
        {/* Animated Corner Accents */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-amber-500/20 to-transparent rounded-br-full blur-xl" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-cyan-500/20 to-transparent rounded-tl-full blur-xl" />

        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

        {/* Side Accent Lines */}
        <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-amber-500/50 via-transparent to-cyan-500/50" />
        <div className="absolute top-0 right-0 w-[2px] h-full bg-gradient-to-b from-cyan-500/50 via-transparent to-amber-500/50" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-1 w-12 bg-gradient-to-r from-amber-500 to-transparent rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400/80">System Control</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black font-headline bg-gradient-to-r from-amber-400 via-orange-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]">
              Admin Dashboard
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-[1px] w-8 bg-gradient-to-r from-cyan-500/50 to-transparent" />
              <p className="text-xs text-cyan-300/60 font-medium tracking-wide">Status Monitoring & Case Management</p>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Separator with Glow */}
      <div className="relative h-[2px] w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      </div>

      {/* Dialogs relocated to this section for better management */}
      <Dialog open={isAddCaseOpen} onOpenChange={setIsAddCaseOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[#0a0a0a] border-white/10 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add New Case</DialogTitle>
            <DialogDescription>Fill in the details for the new debt collection case.</DialogDescription>
          </DialogHeader>
          <form onSubmit={newCaseForm.handleSubmit(handleAddCase)} className="space-y-4 py-4">
            <div className="grid grid-cols-[140px_1fr] items-center gap-4 px-2">
              <Label htmlFor="debtorName" className="text-right font-bold text-cyan-100">Debtor Name</Label>
              <div className="space-y-1">
                <Input id="debtorName" {...newCaseForm.register("debtorName")} className="bg-transparent border-white/20 focus:border-amber-500 focus:ring-amber-500/20" />
                {newCaseForm.formState.errors.debtorName && <p className="text-[10px] text-red-500 font-bold uppercase">{newCaseForm.formState.errors.debtorName.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-[140px_1fr] items-center gap-4 px-2">
              <Label htmlFor="invoiceNo" className="text-right font-bold text-cyan-100">Invoice #</Label>
              <div className="space-y-1">
                <Input id="invoiceNo" {...newCaseForm.register("invoiceNo")} className="bg-transparent border-white/20 focus:border-amber-500 focus:ring-amber-500/20" />
                {newCaseForm.formState.errors.invoiceNo && <p className="text-[10px] text-red-500 font-bold uppercase">{newCaseForm.formState.errors.invoiceNo.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-[140px_1fr] items-center gap-4 px-2">
              <Label htmlFor="dueAmount" className="text-right font-bold text-cyan-100">Amount</Label>
              <div className="space-y-1">
                <Input id="dueAmount" type="number" {...newCaseForm.register("dueAmount")} className="bg-transparent border-white/20 focus:border-amber-500 focus:ring-amber-500/20" />
                {newCaseForm.formState.errors.dueAmount && <p className="text-[10px] text-red-500 font-bold uppercase">{newCaseForm.formState.errors.dueAmount.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-[140px_1fr] items-center gap-4 px-2">
              <Label htmlFor="dueDate" className="text-right font-bold text-cyan-100">Due Date</Label>
              <div className="space-y-1">
                <Input id="dueDate" type="date" {...newCaseForm.register("dueDate")} className="bg-transparent border-white/20 focus:border-amber-500 focus:ring-amber-500/20" />
                {newCaseForm.formState.errors.dueDate && <p className="text-[10px] text-red-500 font-bold uppercase">{newCaseForm.formState.errors.dueDate.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-[140px_1fr] items-center gap-4 px-2">
              <Label htmlFor="hasOverdueHistory" className="text-right font-bold text-cyan-100 leading-tight">Prev. Overdue Count</Label>
              <div className="space-y-1">
                <Input id="hasOverdueHistory" type="number" {...newCaseForm.register("hasOverdueHistory")} className="bg-transparent border-white/20 focus:border-amber-500 focus:ring-amber-500/20" />
                {newCaseForm.formState.errors.hasOverdueHistory && <p className="text-[10px] text-red-500 font-bold uppercase">{newCaseForm.formState.errors.hasOverdueHistory.message}</p>}
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-3 pt-6 px-2">
              <Button type="button" variant="secondary" onClick={() => setIsAddCaseOpen(false)} className="bg-[#333] hover:bg-[#444] text-cyan-100 border-none min-w-[100px]">Cancel</Button>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-cyan-100 border-none min-w-[120px] font-bold">Create Case</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDcaOpen} onOpenChange={setIsAddDcaOpen}>
        <DialogContent className="sm:max-w-[450px] bg-[#0a0a0a] border-white/10 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add New DCA</DialogTitle>
            <DialogDescription>Onboard a new collection agent to the system.</DialogDescription>
          </DialogHeader>
          <form onSubmit={newDcaForm.handleSubmit(handleAddDca)} className="space-y-4 py-4">
            <div className="grid grid-cols-[120px_1fr] items-center gap-4 px-2">
              <Label htmlFor="name" className="text-right font-bold text-cyan-100">Full Name</Label>
              <div className="space-y-1">
                <Input id="name" {...newDcaForm.register("name")} className="bg-transparent border-white/20 focus:border-amber-500 focus:ring-amber-500/20" />
                {newDcaForm.formState.errors.name && <p className="text-[10px] text-red-500 font-bold uppercase">{newDcaForm.formState.errors.name.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4 px-2">
              <Label htmlFor="username" className="text-right font-bold text-cyan-100">Username</Label>
              <div className="space-y-1">
                <Input id="username" {...newDcaForm.register("username")} className="bg-transparent border-white/20 focus:border-amber-500 focus:ring-amber-500/20" />
                {newDcaForm.formState.errors.username && <p className="text-[10px] text-red-500 font-bold uppercase">{newDcaForm.formState.errors.username.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4 px-2">
              <Label htmlFor="password" className="text-right font-bold text-cyan-100">Password</Label>
              <div className="space-y-1">
                <Input id="password" type="password" {...newDcaForm.register("password")} className="bg-transparent border-white/20 focus:border-amber-500 focus:ring-amber-500/20" />
                {newDcaForm.formState.errors.password && <p className="text-[10px] text-red-500 font-bold uppercase">{newDcaForm.formState.errors.password.message}</p>}
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-3 pt-6 px-2">
              <Button type="button" variant="secondary" onClick={() => setIsAddDcaOpen(false)} className="bg-[#333] hover:bg-[#444] text-cyan-100 border-none min-w-[100px]">Cancel</Button>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-cyan-100 border-none min-w-[120px] font-bold">Register Agent</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddScheduleOpen} onOpenChange={setIsAddScheduleOpen}>
        <DialogContent className="sm:max-w-[450px] bg-[#0a0a0a] border-white/10 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Schedule Task</DialogTitle>
            <DialogDescription>Assign a new task to a collection agent's timetable.</DialogDescription>
          </DialogHeader>
          <form onSubmit={timetableForm.handleSubmit(handleAddSchedule)} className="space-y-4 py-4">
            <div className="grid grid-cols-[120px_1fr] items-center gap-4 px-2">
              <Label htmlFor="dcaId" className="text-right font-bold text-cyan-100">Agent</Label>
              <div className="space-y-1">
                <Controller
                  name="dcaId"
                  control={timetableForm.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="bg-transparent border-white/20 focus:border-amber-500">
                        <SelectValue placeholder="Select Agent" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10">
                        {dcas.map((dca) => (
                          <SelectItem key={dca.id} value={dca.id} className="focus:bg-amber-500/20 focus:text-amber-400">{dca.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {timetableForm.formState.errors.dcaId && <p className="text-[10px] text-red-500 font-bold uppercase">{timetableForm.formState.errors.dcaId.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-[120px_1fr] items-start gap-4 px-2">
              <Label htmlFor="task" className="text-right font-bold text-cyan-100 pt-2">Task</Label>
              <div className="space-y-1">
                <Textarea id="task" {...timetableForm.register("task")} className="bg-transparent border-white/20 focus:border-amber-500 min-h-[80px]" />
                {timetableForm.formState.errors.task && <p className="text-[10px] text-red-500 font-bold uppercase">{timetableForm.formState.errors.task.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4 px-2">
              <Label htmlFor="date" className="text-right font-bold text-cyan-100">Date</Label>
              <div className="space-y-1">
                <Input id="date" type="date" {...timetableForm.register("date")} className="bg-transparent border-white/20 focus:border-amber-500" />
                {timetableForm.formState.errors.date && <p className="text-[10px] text-red-500 font-bold uppercase">{timetableForm.formState.errors.date.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4 px-2">
              <Label htmlFor="time" className="text-right font-bold text-cyan-100">Time</Label>
              <div className="space-y-1">
                <Input id="time" type="time" {...timetableForm.register("time")} className="bg-transparent border-white/20 focus:border-amber-500" />
                {timetableForm.formState.errors.time && <p className="text-[10px] text-red-500 font-bold uppercase">{timetableForm.formState.errors.time.message}</p>}
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-3 pt-6 px-2">
              <Button type="button" variant="secondary" onClick={() => setIsAddScheduleOpen(false)} className="bg-[#333] hover:bg-[#444] text-cyan-100 border-none min-w-[100px]">Cancel</Button>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-cyan-100 border-none min-w-[120px] font-bold">Schedule Task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-black/20 backdrop-blur-md border border-white/10">
          <TabsTrigger value="overview" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <TrendingUp className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="cases" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Briefcase className="mr-2 h-4 w-4" />
            Case Management
          </TabsTrigger>
          <TabsTrigger value="responses" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <MessageCircleQuestion className="mr-2 h-4 w-4" />
            Responses
          </TabsTrigger>
          <TabsTrigger value="dcas" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Users className="mr-2 h-4 w-4" />
            DCA Management
          </TabsTrigger>
          <TabsTrigger value="timetable" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Calendar className="mr-2 h-4 w-4" />
            Timetable
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            {/* Total Due Card - Amber Theme - Crystal Clear */}
            <Card className="relative overflow-hidden border-2 border-amber-500 bg-card hover:border-amber-400 transition-all group shadow-[0_0_15px_rgba(245,158,11,0.5),inset_0_0_10px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.7),inset_0_0_15px_rgba(245,158,11,0.3)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all" />
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-amber-400 drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]">
                  Total Due Amount
                </CardTitle>
                <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.4)]">
                  <DollarSign className="h-4 w-4 text-amber-300 drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-black text-amber-300 drop-shadow-[0_0_5px_rgba(245,158,11,0.6)]">
                  ₹{totalDue.toLocaleString()}
                </div>
                <p className="text-xs text-amber-200 mt-2 font-medium drop-shadow-[0_0_1px_rgba(0,0,0,0.8)]">
                  Across all active cases
                </p>
              </CardContent>
            </Card>

            {/* Overdue Cases Card - Red Theme - Crystal Clear */}
            <Card className="relative overflow-hidden border-2 border-red-500 bg-card hover:border-red-400 transition-all group shadow-[0_0_15px_rgba(239,68,68,0.5),inset_0_0_10px_rgba(239,68,68,0.2)] hover:shadow-[0_0_25px_rgba(239,68,68,0.7),inset_0_0_15px_rgba(239,68,68,0.3)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all" />
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-red-400 drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]">
                  Overdue Cases
                </CardTitle>
                <div className="p-2 bg-red-500/10 rounded-lg border border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.4)]">
                  <Activity className="h-4 w-4 text-red-300 drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-black text-red-300 drop-shadow-[0_0_5px_rgba(239,68,68,0.6)]">
                  +{overdueCases}
                </div>
                <p className="text-xs text-red-200 mt-2 font-medium drop-shadow-[0_0_1px_rgba(0,0,0,0.8)]">
                  Cases currently in progress or defaulted
                </p>
              </CardContent>
            </Card>

            {/* Total Cases Card - Green Theme - Crystal Clear */}
            <Card className="relative overflow-hidden border-2 border-green-500 bg-card hover:border-green-400 transition-all group shadow-[0_0_15px_rgba(34,197,94,0.5),inset_0_0_10px_rgba(34,197,94,0.2)] hover:shadow-[0_0_25px_rgba(34,197,94,0.7),inset_0_0_15px_rgba(34,197,94,0.3)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all" />
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-green-400 drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]">Total Cases</CardTitle>
                <div className="p-2 bg-green-500/10 rounded-lg border border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.4)]">
                  <CreditCard className="h-4 w-4 text-green-300 drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-black text-green-300 drop-shadow-[0_0_5px_rgba(34,197,94,0.6)]">{cases.length}</div>
                <p className="text-xs text-green-200 mt-2 font-medium drop-shadow-[0_0_1px_rgba(0,0,0,0.8)]">
                  Total cases in the system
                </p>
              </CardContent>
            </Card>

            {/* Active DCAs Card - amber Theme - Crystal Clear */}
            <Card className="relative overflow-hidden border-2 border-amber-500 bg-card hover:border-amber-400 transition-all group shadow-[0_0_15px_rgba(6,182,212,0.5),inset_0_0_10px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.7),inset_0_0_15px_rgba(6,182,212,0.3)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all" />
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-amber-400 drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]">Active DCAs</CardTitle>
                <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                  <Users className="h-4 w-4 text-amber-300 drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-black text-amber-300 drop-shadow-[0_0_5px_rgba(6,182,212,0.6)]">{dcas.length}</div>
                <p className="text-xs text-amber-200 mt-2 font-medium drop-shadow-[0_0_1px_rgba(0,0,0,0.8)]">
                  Debt Collection Agents
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="mt-8">
            <Card className="bg-card shadow-2xl">
              <CardHeader>
                <CardTitle>Case Status Overview</CardTitle>
                <CardDescription>
                  A summary of cases by their assignment and resolution status.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20 }}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        backdropFilter: "blur(10px)",
                      }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="value" position="top" className="fill-foreground" fontSize={12} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cases">
          <Card className="bg-card shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>Unresolved Cases</CardTitle>
                  <CardDescription>
                    Manage, assign, and prioritize debt collection cases that have no feedback yet.
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setIsAddCaseOpen(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-cyan-100 border-none shadow-lg shadow-amber-500/20"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Case
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Debtor</TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assigned DCA</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unresolvedCases.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        {c.debtorName}
                      </TableCell>
                      <TableCell>{c.invoiceNo}</TableCell>
                      <TableCell>₹{c.dueAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={c.status === 'Paid' ? 'secondary' : c.status === 'Defaulted' ? 'destructive' : 'outline'}>{c.status}</Badge>
                      </TableCell>
                      <TableCell>{c.priorityScore || "N/A"}</TableCell>
                      <TableCell>
                        {c.assignedDcaId
                          ? dcas.find((d) => d.id === c.assignedDcaId)?.name
                          : "Unassigned"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setSelectedCase(c); setAssignedDca(c.assignedDcaId); }}
                                className="border-amber-500/50 text-amber-400 hover:bg-amber-500 hover:text-cyan-100"
                              >
                                Assign
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Assign Case: {selectedCase?.debtorName}</DialogTitle>
                                <DialogDescription>
                                  Assign this case to a Debt Collection Agent.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <Select onValueChange={setAssignedDca} defaultValue={assignedDca || undefined}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a DCA" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {dcas.map((dca) => (
                                      <SelectItem key={dca.id} value={dca.id}>
                                        {dca.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="secondary">Cancel</Button>
                                </DialogClose>
                                <DialogClose asChild>
                                  <Button onClick={handleAssignDCA} className="bg-amber-500 hover:bg-amber-600 text-cyan-100 border-none">Assign Case</Button>
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedCase(c);
                                  setPriorityResult(null);
                                }}
                                className="border-amber-500/50 text-amber-400 hover:bg-amber-500 hover:text-cyan-100"
                              >
                                <BrainCircuit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  AI Case Prioritization
                                </DialogTitle>
                                <DialogDescription>
                                  Analyze case data to determine its priority score.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4 space-y-4">
                                <div className="space-y-2 text-cyan-100/90">
                                  <p><strong>Debtor:</strong> {selectedCase?.debtorName}</p>
                                  <p><strong>Invoice #:</strong> {selectedCase?.invoiceNo}</p>
                                  <p><strong>Amount:</strong> ₹{selectedCase?.dueAmount.toLocaleString()}</p>
                                  <p><strong>Overdue:</strong> {selectedCase?.overdueAging} days</p>
                                  <p><strong>Past Overdue Count:</strong> {selectedCase?.hasOverdueHistory}</p>
                                </div>
                              </div>
                              <Button
                                onClick={handlePrioritize}
                                disabled={isPrioritizing}
                                className="bg-amber-500 hover:bg-amber-600 text-cyan-100 border-none"
                              >
                                {isPrioritizing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Run AI Analysis
                              </Button>
                              {priorityResult && (
                                <Card className="mt-4 bg-secondary">
                                  <CardHeader>
                                    <CardTitle>AI Analysis Result</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <p className="text-cyan-100"><strong>Priority Score:</strong> {priorityResult.priorityScore}/100</p>
                                    <p className="mt-2 text-cyan-200/70"><strong>Reason:</strong> {priorityResult.priorityReason}</p>
                                  </CardContent>
                                </Card>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responses">
          <Card className="bg-card shadow-2xl">
            <CardHeader>
              <CardTitle>Case Responses</CardTitle>
              <CardDescription>
                Review cases that have received feedback from DCAs and mark them as resolved.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Debtor</TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Assigned DCA</TableHead>
                    <TableHead>Response Mode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Feedback</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {respondedCases.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        {c.debtorName}
                      </TableCell>
                      <TableCell>{c.invoiceNo}</TableCell>
                      <TableCell>
                        {dcas.find((d) => d.id === c.assignedDcaId)?.name}
                      </TableCell>
                      <TableCell className="capitalize">
                        {c.responseMode}
                      </TableCell>
                      <TableCell>
                        <Badge variant={c.status === 'Paid' ? 'secondary' : c.status === 'Defaulted' ? 'destructive' : 'outline'}>{c.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {c.feedback}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsPaid(c.id)}
                          className="border-amber-500/50 text-amber-400 hover:bg-amber-500 hover:text-cyan-100"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Mark as Paid
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dcas">
          <Card className="bg-card shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>DCA Management</CardTitle>
                  <CardDescription>
                    Analyze performance of Debt Collection Agents.
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setIsAddDcaOpen(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-cyan-100 border-none shadow-lg shadow-amber-500/20"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add DCA
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Cases</TableHead>
                    <TableHead>Recovery Rate</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dcas.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.name}</TableCell>
                      <TableCell>{d.username}</TableCell>
                      <TableCell>{cases.filter(c => c.assignedDcaId === d.id).length}</TableCell>
                      <TableCell>{(d.recoveryRate * 100).toFixed(0)}%</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedDca(d);
                                setDcaAnalysisResult(null);
                              }}
                              className="border-amber-500/50 text-amber-400 hover:bg-amber-500 hover:text-cyan-100"
                            >
                              <BrainCircuit className="h-4 w-4 mr-2" />
                              Analyze
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>
                                AI Performance Analysis: {selectedDca?.name}
                              </DialogTitle>
                              <DialogDescription>
                                Analyze DCA performance based on their case history.
                              </DialogDescription>
                            </DialogHeader>
                            <Button
                              onClick={handleAnalyzeDca}
                              disabled={isAnalyzing}
                              className="bg-amber-500 hover:bg-amber-600 text-cyan-100 border-none"
                            >
                              {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Run AI Analysis
                            </Button>
                            {dcaAnalysisResult && (
                              <div className="mt-4 space-y-4 max-h-[50vh] overflow-y-auto">
                                <Card>
                                  <CardHeader>
                                    <CardTitle>Analysis Summary</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <p className="text-sm text-cyan-200/70 leading-relaxed">{dcaAnalysisResult.analysisSummary}</p>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardHeader>
                                    <CardTitle>Recommended Assignments</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <p className="text-sm text-cyan-200/70 leading-relaxed">{dcaAnalysisResult.recommendedAssignments}</p>
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="bg-red-500/80 hover:bg-red-600 shadow-lg shadow-red-500/20"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently remove the agent <span className="font-bold">{d.name}</span> and unassign all their cases.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRemoveDca(d.id, d.name)} className="bg-amber-500 hover:bg-amber-600 text-cyan-100 border-none">
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timetable">
          <Card className="bg-card shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>Team Timetable</CardTitle>
                  <CardDescription>
                    Overview of scheduled tasks for all agents.
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setIsAddScheduleOpen(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-cyan-100 border-none shadow-lg shadow-amber-500/20"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...new Set(timetable.map(t => t.date))].sort((a, b) => new Date(a).getTime() - new Date(b).getTime()).map(date => (
                  <div key={date}>
                    <h3 className="text-lg font-semibold font-headline mb-2">{format(new Date(date), 'EEEE, MMMM do')}</h3>
                    <div className="border-l-2 border-primary pl-4 space-y-2">
                      {timetable.filter(t => t.date === date).sort((a, b) => a.time.localeCompare(b.time)).map(task => (
                        <div key={task.id} className="p-3 rounded-md bg-secondary flex justify-between items-center">
                          <div className="flex-1">
                            <p className="font-medium">{task.task}</p>
                            <p className="text-sm text-cyan-200/60">{dcas.find(d => d.id === task.dcaId)?.name}</p>
                          </div>
                          <div className="text-sm text-cyan-200/60 mr-4">{task.time}</div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditTimetableDialog(task)}
                              className="text-cyan-200/50 hover:text-amber-400"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-cyan-200/50 hover:text-red-400"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Task?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove the task "<span className="font-bold">{task.task}</span>"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRemoveSchedule(task.id, task.task)}
                                    className="bg-red-500 hover:bg-red-600 text-white"
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Dialog open={isEditTimetableOpen} onOpenChange={setIsEditTimetableOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Timetable Entry</DialogTitle>
                <DialogDescription>
                  Update the details for this scheduled task.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={timetableForm.handleSubmit(handleEditTimetable)}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dcaId-edit" className="text-right">Assign to</Label>
                    <Controller
                      name="dcaId"
                      control={timetableForm.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger id="dcaId-edit" className="col-span-3">
                            <SelectValue placeholder="Select a DCA" />
                          </SelectTrigger>
                          <SelectContent>
                            {dcas.map((dca) => (
                              <SelectItem key={dca.id} value={dca.id}>
                                {dca.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {timetableForm.formState.errors.dcaId && <p className="col-span-4 text-xs text-destructive text-right">{timetableForm.formState.errors.dcaId.message}</p>}
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="task-edit" className="text-right">Task</Label>
                    <Textarea id="task-edit" {...timetableForm.register("task")} className="col-span-3" />
                    {timetableForm.formState.errors.task && <p className="col-span-4 text-xs text-destructive text-right">{timetableForm.formState.errors.task.message}</p>}
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date-edit" className="text-right">Date</Label>
                    <Input id="date-edit" type="date" {...timetableForm.register("date")} className="col-span-3" />
                    {timetableForm.formState.errors.date && <p className="col-span-4 text-xs text-destructive text-right">{timetableForm.formState.errors.date.message}</p>}
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="time-edit" className="text-right">Time</Label>
                    <Input id="time-edit" type="time" {...timetableForm.register("time")} className="col-span-3" />
                    {timetableForm.formState.errors.time && <p className="col-span-4 text-xs text-destructive text-right">{timetableForm.formState.errors.time.message}</p>}
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
                  <Button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-cyan-100 border-none"
                  >
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
