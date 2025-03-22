"use client";

import type { ToolInvocation } from "ai";
import { FormInput } from "lucide-react";
import { ToolOutput, ToolOutputBadge } from "@/components/tool-output";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { updateStructuredDataResponse } from "@/actions/chats/get-structured-data";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useChat } from "@ai-sdk/react";

export type StructuredDataRequestProps = {
  request: ToolInvocation & {
    args: {
      title: string;
      description: string;
      fields: Array<{
        id: string;
        label: string;
        type: string;
        placeholder?: string;
        options?: string[];
        required?: boolean;
        validation?: string;
      }>;
    };
  };
  formResponseId: string;
  state: string;
  formData: Record<string, unknown> | null;
  className?: string;
  chatId: string;
};

export function StructuredDataRequest({
  request,
  chatId,
  formResponseId,
  state,
  formData,
  className,
}: StructuredDataRequestProps) {
  const { addToolResult, reload } = useChat({
    id: chatId,
  });

  // Extract request from the props, handling both custom format and ToolInvocation
  let title = "";
  let description = "";
  let fields: Array<{
    id: string;
    label: string;
    type: string;
    placeholder?: string;
    options?: string[];
    required?: boolean;
    validation?: string;
  }> = [];

  if ("args" in request) {
    title = request.args.title;
    description = request.args.description;
    fields = request.args.fields;
  } else if ("input" in request) {
    // Handle tool invocation format
    // Type assertion to make TypeScript happy
    const reqWithInput = request as { input: Record<string, unknown> };
    const input = reqWithInput.input;

    if (input && typeof input === "object") {
      if ("title" in input && typeof input.title === "string") {
        title = input.title;
      }
      if ("description" in input && typeof input.description === "string") {
        description = input.description;
      }
      if ("fields" in input && Array.isArray(input.fields)) {
        fields = input.fields as Array<{
          id: string;
          label: string;
          type: string;
          placeholder?: string;
          options?: string[];
          required?: boolean;
          validation?: string;
        }>;
      }
    }
  }

  // Use form data from props or initialize new form data
  const [formValues, setFormValues] = useState<Record<string, unknown>>(
    formData ?? {},
  );
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Setup React Query
  const queryClient = useQueryClient();

  // Create mutations for form submission and cancellation
  const submitMutation = useMutation({
    mutationFn: (data: {
      id: string;
      state: string;
      formData: Record<string, unknown>;
    }) => {
      addToolResult({
        toolCallId: request.toolCallId,
        result: `Form submitted successfully with data: ${JSON.stringify(data.formData, null, 2)}`,
      });

      return updateStructuredDataResponse(data.id, {
        state: data.state,
        formData: data.formData,
      });
    },
    onSuccess: () => {
      // Invalidate any queries that might depend on this data
      queryClient.invalidateQueries({
        queryKey: ["formResponse"],
      });
      toast.success("Form submitted successfully");
    },
    onError: (error) => {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit form");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => {
      addToolResult({
        toolCallId: request.toolCallId,
        result: "Form request cancelled",
      });

      return updateStructuredDataResponse(id, {
        state: "cancelled",
      });
    },
    onSuccess: () => {
      // Invalidate any queries that might depend on this data
      queryClient.invalidateQueries({
        queryKey: ["formResponse"],
      });
      toast.info("Form request cancelled");
    },
    onError: (error) => {
      console.error("Error cancelling form:", error);
      toast.error("Failed to cancel form request");
    },
  });

  // Get submission state from mutations
  const isSubmitting = submitMutation.isPending || cancelMutation.isPending;

  // Validation function
  const validateField = (
    field: {
      id: string;
      label: string;
      required?: boolean;
      validation?: string;
    },
    value: unknown,
  ) => {
    if (
      field.required &&
      (!value || (typeof value === "string" && value.trim() === ""))
    ) {
      return `${field.label} is required`;
    }

    if (field.validation && typeof value === "string" && value) {
      const regex = new RegExp(field.validation);
      if (!regex.test(value)) {
        return `${field.label} is invalid`;
      }
    }

    return "";
  };

  const handleChange = (
    field: { id: string; label: string },
    value: unknown,
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [field.id]: value,
    }));

    // Validate on change
    const error = validateField(field, value);
    setFormErrors((prev) => ({
      ...prev,
      [field.id]: error,
    }));
  };

  const handleSubmit = async () => {
    // Validate all fields
    const errors: Record<string, string> = {};
    let hasErrors = false;

    for (const field of fields) {
      const error = validateField(field, formValues[field.id]);
      if (error) {
        errors[field.id] = error;
        hasErrors = true;
      }
    }

    setFormErrors(errors);

    if (hasErrors) {
      return;
    }

    // Use the mutation to submit
    submitMutation.mutate({
      id: formResponseId,
      state: "submitted",
      formData: formValues,
    });
  };

  const handleCancel = async () => {
    // Use the mutation to cancel
    cancelMutation.mutate(formResponseId);
  };

  // Render different UI based on state
  const renderFormContent = () => {
    if (state === "submitted") {
      return (
        <div className="space-y-4">
          <div className="text-sm font-medium text-green-600 dark:text-green-400">
            Form submitted successfully
          </div>
          <div className="border rounded-md p-4 bg-muted/20 space-y-2">
            {fields.map((field) => (
              <div key={field.id} className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground">
                  {field.label}
                </div>
                <div className="text-sm">
                  {field.type === "checkbox"
                    ? formValues[field.id]
                      ? "Yes"
                      : "No"
                    : formValues[field.id]?.toString() || "-"}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (state === "cancelled") {
      return (
        <div className="text-sm text-muted-foreground italic">
          This data request was cancelled.
        </div>
      );
    }

    // Default: render form for input
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>

        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <label
                htmlFor={field.id}
                className="text-sm font-medium flex items-center"
              >
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {field.type === "textarea" ? (
                <Textarea
                  id={field.id}
                  placeholder={field.placeholder || undefined}
                  value={(formValues[field.id] as string) || ""}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className={cn(formErrors[field.id] && "border-red-500")}
                />
              ) : field.type === "select" ? (
                <select
                  id={field.id}
                  value={(formValues[field.id] as string) || ""}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary",
                    formErrors[field.id] && "border-red-500",
                  )}
                >
                  <option value="">Select an option</option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : field.type === "checkbox" ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={field.id}
                    checked={!!formValues[field.id]}
                    onChange={(e) => handleChange(field, e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </div>
              ) : (
                <Input
                  id={field.id}
                  type={field.type}
                  placeholder={field.placeholder || undefined}
                  value={(formValues[field.id] as string) || ""}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className={cn(formErrors[field.id] && "border-red-500")}
                />
              )}

              {formErrors[field.id] && (
                <p className="text-xs text-red-500">{formErrors[field.id]}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex space-x-2 justify-end">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <ToolOutput
      title={title || "Data Request"}
      icon={FormInput}
      badge={<ToolOutputBadge variant="info">Data Request</ToolOutputBadge>}
      content={renderFormContent()}
      className={className}
    />
  );
}
