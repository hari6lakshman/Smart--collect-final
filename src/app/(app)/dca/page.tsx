
"use client";

import { useState } from "react";
import {
  Briefcase,
  Calendar,
  BrainCircuit,
  Loader2,
  Send,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Case } from "@/lib/types";
import { suggestCommunicationMode } from "@/ai/flows/suggest-communication-mode";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useAppContext } from "@/context/app-context";

type SuggestionResult = {
  suggestedChannel: 'calling' | 'email' | 'messaging';
  reasoning: string;
};

export default function DcaDashboard() {
  const { toast } = useToast();
  const { cases, timetable, loggedInUser, updateCase } = useAppContext();

  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [suggestionResult, setSuggestionResult] = useState<SuggestionResult | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [responseMode, setResponseMode] = useState<'calling' | 'email' | 'messaging' | undefined>();

  if (!loggedInUser || loggedInUser.role !== 'DCA') {
    return null;
  }

  const myCases = cases.filter(c => c.assignedDcaId === loggedInUser.id && c.status !== 'Paid' && c.status !== 'Defaulted');
  const myTimetable = timetable.filter(t => t.dcaId === loggedInUser.id);

  const handleSuggestMode = async () => {
    if (!selectedCase) return;
    setIsSuggesting(true);
    setSuggestionResult(null);
    try {
      const result = await suggestCommunicationMode({
        caseHistory: selectedCase.communicationHistory
      });
      setSuggestionResult(result);
    } catch (error) {
      console.error("Suggestion failed:", error);
      toast({
        variant: "destructive",
        title: "AI Suggestion Failed",
        description: "Could not get communication suggestion. Please try again.",
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSendFeedback = () => {
    if (selectedCase && feedbackNotes && responseMode) {
      updateCase(selectedCase.id, { feedback: feedbackNotes, responseMode: responseMode, status: 'In Progress' });
      toast({
        title: "Feedback Submitted",
        description: `Your feedback for case ${selectedCase.invoiceNo} has been sent.`,
      });
      setFeedbackNotes('');
      setResponseMode(undefined);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md shadow-2xl">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl font-headline bg-gradient-to-r from-orange-400 to-cyan-400 bg-clip-text text-transparent">
            DCA Dashboard
          </h1>
          <p className="text-sm text-cyan-200/50 mt-1 font-medium tracking-tight">Agent Terminal & Field Intelligence Console</p>
        </div>
        <div className="hidden md:flex items-center gap-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl px-4 py-2">
          <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold">CONNECTION: Stable</span>
        </div>
      </div>

      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <Tabs defaultValue="cases" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-black/20 backdrop-blur-md border border-white/10">
          <TabsTrigger value="cases" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Briefcase className="mr-2 h-4 w-4" />
            My Cases
          </TabsTrigger>
          <TabsTrigger value="timetable" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Calendar className="mr-2 h-4 w-4" />
            My Timetable
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cases">
          <Card className="bg-card shadow-2xl">
            <CardHeader>
              <CardTitle>My Assigned Cases</CardTitle>
              <CardDescription>
                Manage your assigned debt collection cases.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Debtor</TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myCases.filter(c => !c.feedback).map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        {c.debtorName}
                      </TableCell>
                      <TableCell>{c.invoiceNo}</TableCell>
                      <TableCell>₹{c.dueAmount.toLocaleString()}</TableCell>
                      <TableCell>{format(new Date(c.dueDate), 'PPP')}</TableCell>
                      <TableCell>
                        <Badge variant={c.status === 'Paid' ? 'secondary' : c.status === 'Defaulted' ? 'destructive' : 'outline'}>{c.status}</Badge>
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedCase(c);
                                setSuggestionResult(null);
                              }}
                              className="border-amber-500/50 text-amber-400 hover:bg-amber-500 hover:text-cyan-100"
                            >
                              <BrainCircuit className="h-4 w-4 mr-2" />
                              Suggest Mode
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>AI Communication Suggestion</DialogTitle>
                              <DialogDescription>
                                Get an AI-powered suggestion for the best way to contact {selectedCase?.debtorName}.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-2">
                              <p><strong>Case History Summary:</strong></p>
                              <p className="text-sm text-cyan-200/60">{selectedCase?.communicationHistory}</p>
                            </div>
                            <Button
                              onClick={handleSuggestMode}
                              disabled={isSuggesting}
                              className="bg-amber-500 hover:bg-amber-600 text-cyan-100 border-none"
                            >
                              {isSuggesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Get Suggestion
                            </Button>
                            {suggestionResult && (
                              <Card className="mt-4 bg-secondary">
                                <CardHeader>
                                  <CardTitle>AI Suggestion</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="capitalize flex items-center gap-2 text-cyan-100"><strong>Suggested Channel:</strong> <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">{suggestionResult.suggestedChannel}</Badge></div>
                                  <p className="mt-2 text-cyan-200/70 leading-relaxed"><strong>Reasoning:</strong> {suggestionResult.reasoning}</p>
                                </CardContent>
                              </Card>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedCase(c)}
                              className="border-amber-500/50 text-amber-400 hover:bg-amber-500 hover:text-cyan-100"
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Feedback
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Submit Feedback for {selectedCase?.debtorName} ({selectedCase?.invoiceNo})</DialogTitle>
                              <DialogDescription>
                                Update the status and provide notes on the case.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label>Mode of Response</Label>
                                <RadioGroup onValueChange={(value) => setResponseMode(value as 'calling' | 'email' | 'messaging')} value={responseMode} className="flex space-x-4">
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="calling" id="calling" />
                                    <Label htmlFor="calling">Calling</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="email" id="email" />
                                    <Label htmlFor="email">Email</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="messaging" id="messaging" />
                                    <Label htmlFor="messaging">Messaging</Label>
                                  </div>
                                </RadioGroup>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="feedback-notes">Notes</Label>
                                <Textarea id="feedback-notes" placeholder="e.g., Paid in 3 days, requested extension..." value={feedbackNotes} onChange={(e) => setFeedbackNotes(e.target.value)} />
                              </div>
                            </div>
                            <DialogFooter>
                              <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
                              <DialogClose asChild>
                                <Button
                                  onClick={handleSendFeedback}
                                  disabled={!feedbackNotes || !responseMode}
                                  className="bg-amber-500 hover:bg-amber-600 text-cyan-100 border-none"
                                >
                                  Submit Feedback
                                </Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
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
              <CardTitle>My Timetable</CardTitle>
              <CardDescription>
                Your scheduled tasks and appointments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...new Set(myTimetable.map(t => t.date))].sort((a, b) => new Date(a).getTime() - new Date(b).getTime()).map(date => (
                  <div key={date}>
                    <h3 className="text-lg font-semibold font-headline mb-2">{format(new Date(date), 'EEEE, MMMM do')}</h3>
                    <div className="border-l-2 border-primary pl-4 space-y-2">
                      {myTimetable.filter(t => t.date === date).map(task => (
                        <div key={task.id} className="p-3 rounded-md bg-secondary flex justify-between items-center">
                          <div>
                            <p className="font-medium">{task.task}</p>
                          </div>
                          <div className="text-sm text-cyan-200/60">{task.time}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


