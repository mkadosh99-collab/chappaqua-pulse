import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { insertBusinessSubmissionSchema, type InsertBusinessSubmission } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const CATEGORY_OPTIONS: { value: InsertBusinessSubmission["category"]; label: string }[] = [
  { value: "food", label: "Food & Drink" },
  { value: "apparel", label: "Apparel & Accessories" },
  { value: "specialty", label: "Specialty Retail" },
  { value: "home", label: "Home & Design" },
  { value: "wellness", label: "Health & Wellness" },
  { value: "service", label: "Services" },
  { value: "civic", label: "Civic & Community" },
];

const CLUSTER_OPTIONS = [
  { value: "chappaqua_downtown", label: "Downtown Chappaqua" },
  { value: "chappaqua_south", label: "South Greeley Ave" },
  { value: "chappaqua_north", label: "North Greeley Ave" },
  { value: "millwood", label: "Millwood" },
  { value: "king_st", label: "King Street" },
  { value: "station_plaza", label: "Station Plaza" },
];

export function SubmitBusinessDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<InsertBusinessSubmission>({
    resolver: zodResolver(insertBusinessSubmissionSchema),
    defaultValues: {
      name: "",
      category: undefined as unknown as InsertBusinessSubmission["category"],
      cluster: "",
      address: "",
      owner: "",
      description: "",
      website: "",
      contactName: "",
      contactEmail: "",
    },
  });

  async function onSubmit(values: InsertBusinessSubmission) {
    try {
      await apiRequest("POST", "/api/business-submissions", values);
      toast({
        title: "Thanks for your submission!",
        description: "We'll review your business and add it to the directory once approved.",
      });
      form.reset();
      setOpen(false);
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-open-submit-business" className="gap-2">
          <Plus className="h-4 w-4" />
          Submit a Business
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit a Business</DialogTitle>
          <DialogDescription>
            Know a local shop, restaurant, or service that should be in the directory? Send it our
            way. We'll review it before it goes live.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. King Street Creatives" data-testid="input-business-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-business-category">
                        <SelectValue placeholder="Choose a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} data-testid={`option-category-${opt.value}`}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street address *</FormLabel>
                  <FormControl>
                    <Input placeholder="100 King Street, Chappaqua NY 10514" data-testid="input-business-address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cluster"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area (optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger data-testid="select-business-cluster">
                        <SelectValue placeholder="Choose an area" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CLUSTER_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} data-testid={`option-cluster-${opt.value}`}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="owner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Owner / manager (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" data-testid="input-business-owner" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What does this business offer?"
                      data-testid="input-business-description"
                      rows={3}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" data-testid="input-business-website" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your name (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" data-testid="input-contact-name" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your email (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" data-testid="input-contact-email" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription>So we can reach you with questions.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                data-testid="button-cancel-submit"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting} data-testid="button-submit-business">
                {form.formState.isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
