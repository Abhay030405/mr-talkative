import Link from "next/link";
import { ArrowLeft, MessageSquare, Brain, Award, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Chat
          </Button>
        </Link>

        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              What is Mr. Talkative?
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your intelligent academic companion for B.Tech studies — designed to help you learn,
              practice, and excel.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Personalized Learning</CardTitle>
                <CardDescription>
                  Tailored academic assistance based on your semester and branch of engineering
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Select your semester (1-8) and branch (CSE, IT, EE, ECE) to get contextual help
                  specific to your curriculum.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Multiple Modes</CardTitle>
                <CardDescription>Three powerful modes to support different learning needs</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>
                    • <strong>General Doubts:</strong> Ask any academic question
                  </li>
                  <li>
                    • <strong>Generate Quiz:</strong> Practice with custom quizzes
                  </li>
                  <li>
                    • <strong>Evaluate Answers:</strong> Get feedback on your solutions
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Mock Tests</CardTitle>
                <CardDescription>Prepare for exams with comprehensive mock tests</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Access practice tests designed to simulate real exam conditions and improve your
                  performance.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Study Library</CardTitle>
                <CardDescription>Organize and access your learning materials</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Upload and manage study materials, notes, and resources in your personal library for
                  easy access.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>How to Use Mr. Talkative</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-semibold">
                    1
                  </div>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Select your context:</strong> Choose your
                    semester, branch, and the mode you want to use
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-semibold">
                    2
                  </div>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Ask or request:</strong> Type your question,
                    request a quiz, or submit answers for evaluation
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-semibold">
                    3
                  </div>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Learn and grow:</strong> Get instant,
                    contextual responses tailored to your needs
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center pt-4">
            <Link href="/">
              <Button size="lg">Start Learning Now</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
