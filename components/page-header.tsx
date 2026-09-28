import { HelpTrigger } from "@/components/help/help-trigger";

export function PageHeader({
  title,
  description,
  action,
  helpTopic,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  helpTopic?: string;
}) {
  return (
    <div className="mb-10 flex flex-col gap-4 border-b border-foreground/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="display flex items-center gap-3 text-4xl tracking-tight lg:text-5xl">
          {title}
          {helpTopic ? <HelpTrigger topicId={helpTopic} /> : null}
        </h1>
        {description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
