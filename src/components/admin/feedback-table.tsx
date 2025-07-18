"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Star } from "lucide-react";
import type { Feedback } from "@/types/server";
import { formatDistanceToNow } from "date-fns";

type AggregatedFeedback = Feedback & { projectTitle: string };

export function FeedbackTable({ feedback }: { feedback: AggregatedFeedback[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Comment (Snippet)</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Sentiment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedback.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No feedback found.
                </TableCell>
              </TableRow>
            ) : (
              feedback.map((fb) => (
                <TableRow key={fb.id}>
                  <TableCell className="font-medium max-w-[150px] truncate" title={fb.projectTitle}>
                    {fb.projectTitle}
                  </TableCell>
                  <TableCell className="max-w-[100px] truncate" title={fb.user_name}>
                    {fb.user_name}
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={fb.comment}>
                    {fb.comment}
                  </TableCell>
                  <TableCell>
                    {fb.rating ? (
                      <div className="flex items-center">
                        {fb.rating}
                        <Star className="ml-1 h-4 w-4 text-yellow-400 fill-yellow-400" />
                      </div>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {fb.sentiment_summary ? (
                      <Badge variant="outline">{fb.sentiment_summary}</Badge>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(
                      fb.created_at ? new Date(fb.created_at) : new Date(),
                      { addSuffix: true }
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Feedback Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem disabled>View Full Feedback</DropdownMenuItem>
                        <DropdownMenuItem disabled>Mark as Reviewed</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" disabled>
                          Delete Feedback
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
