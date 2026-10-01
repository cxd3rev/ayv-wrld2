"use client";

import { ConnectedRecords, IncomingLinkFields } from "@/components/connections/connected-records";
import { Badge } from "@/components/ui/badge";
import { ActionFeedback, AdvancedPanel, AdvancedStats, PrimaryAction, TrashButton } from "@/components/workspace/simple-action";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { recordProductName, type RecordPrefill } from "@/lib/record-entities";
import { cn } from "@/lib/utils";
import { reviewChannels, reviewStatuses } from "@/lib/validations";
import {
  createReview,
  deleteReview,
  updateReviewFollowUp,
  updateReviewStatus,
} from "@/products/ravelo/actions";
import type {
  Booking,
  Invoice,
  Lead,
  Quote,
  Reactivation,
  RecordLink,
  Review,
  ReviewChannel,
  ReviewStatus,
} from "@/types/database";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const statusTone: Record<ReviewStatus, "neutral" | "accent" | "warning" | "success"> = {
  scheduled: "neutral",
  requested: "accent",
  public: "success",
  private: "warning",
  responded: "success",
};

const statusKeys: Record<
  ReviewStatus,
  "statusScheduled" | "statusRequested" | "statusPublic" | "statusPrivate" | "statusResponded"
> = {
  scheduled: "statusScheduled",
  requested: "statusRequested",
  public: "statusPublic",
  private: "statusPrivate",
  responded: "statusResponded",
};

const channelKeys: Record<
  ReviewChannel,
  "channelGoogle" | "channelTrustpilot" | "channelFacebook" | "channelOther" | "channelPrivate"
> = {
  google: "channelGoogle",
  trustpilot: "channelTrustpilot",
  facebook: "channelFacebook",
  other: "channelOther",
  private: "channelPrivate",
};

function isOpen(review: Review) {
  return review.status === "scheduled" || review.status === "requested" || review.status === "private";
}

export function RaveloReviewsWorkspace({
  reviews,
  reactivations,
  leads,
  bookings,
  quotes,
  invoices,
  links,
  prefill,
  focusReviewId,
}: {
  reviews: Review[];
  reactivations: Reactivation[];
  leads: Lead[];
  bookings: Booking[];
  quotes: Quote[];
  invoices: Invoice[];
  links: RecordLink[];
  prefill?: RecordPrefill;
  focusReviewId?: string;
}) {
  const t = useTranslations("ravelo");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const counts = useMemo(
    () => ({
      scheduled: reviews.filter((item) => item.status === "scheduled").length,
      requested: reviews.filter((item) => item.status === "requested").length,
      publicReviews: reviews.filter((item) => item.status === "public").length,
      privateFeedback: reviews.filter((item) => item.status === "private").length,
    }),
    [reviews],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(locale);
    if (!needle) return reviews;
    return reviews.filter((item) =>
      [item.customer_name, item.feedback, item.review_url, item.email, item.phone, item.notes].some((value) =>
        value?.toLocaleLowerCase(locale).includes(needle),
      ),
    );
  }, [locale, query, reviews]);

  useEffect(() => {
    if (!focusReviewId) return;
    document.getElementById(`review-${focusReviewId}`)?.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
  }, [focusReviewId]);

  async function onAdd(formData: FormData) {
    setError("");
    setPending(true);
    const result = await createReview(formData);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(t("added"));
    toast({ title: t("added"), tone: "success" });
    (document.getElementById("ravelo-add") as HTMLFormElement | null)?.reset();
    router.refresh();
  }

  return (
    <div>
      <form id="ravelo-add" action={onAdd} className="workspace-card grid gap-6 p-6 sm:p-8 md:grid-cols-2">
        <div className="md:col-span-2 lg:col-span-4">
          <IncomingLinkFields prefillProduct={prefill?.product} prefillId={prefill?.id} />
          <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">{t("addReview")}</p>
          {prefill ? (
            <p className="mt-2 text-sm text-muted">
              {t("prefill", { name: prefill.name, product: recordProductName(prefill.product) })}
            </p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="customerName">{t("customer")}</Label>
          <Input id="customerName" name="customerName" required defaultValue={prefill?.name ?? ""} />
        </div>
        <div>
          <Label htmlFor="channel">{t("channel")}</Label>
          <select id="channel" name="channel" defaultValue="google" className="h-10 w-full rounded-md border border-foreground/15 bg-card px-2 text-sm">
            {reviewChannels.map((channel) => (
              <option key={channel} value={channel}>{t(channelKeys[channel])}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="requestedOn">{t("requestedOn")}</Label>
          <Input id="requestedOn" name="requestedOn" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
        </div>
        <div>
          <Label htmlFor="nextFollowUpOn">{t("nextFollowUpOn")}</Label>
          <Input id="nextFollowUpOn" name="nextFollowUpOn" type="date" />
        </div>
        <div>
          <Label htmlFor="rating">{t("rating")}</Label>
          <Input id="rating" name="rating" inputMode="numeric" placeholder="5" />
        </div>
        <div>
          <Label htmlFor="reviewUrl">{t("reviewUrl")}</Label>
          <Input id="reviewUrl" name="reviewUrl" placeholder="https://" />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="feedback">{t("feedback")}</Label>
          <Input id="feedback" name="feedback" placeholder={t("feedbackPlaceholder")} />
        </div>
        <div>
          <Label htmlFor="email">{t("email")}</Label>
          <Input id="email" name="email" type="email" defaultValue={prefill?.email ?? ""} />
        </div>
        <div>
          <Label htmlFor="phone">{t("phone")}</Label>
          <Input id="phone" name="phone" type="tel" placeholder={tCommon("optional")} defaultValue={prefill?.phone ?? ""} />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="notes">{t("notes")}</Label>
          <Input id="notes" name="notes" placeholder={t("notesPlaceholder")} />
        </div>
        <div className="md:col-span-2">
          <AdvancedPanel label={tCommon("advanced")}>
            <AdvancedStats
              items={[
                { label: t("scheduled"), value: String(counts.scheduled), hint: t("scheduledHint") },
                { label: t("requested"), value: String(counts.requested), hint: t("requestedHint") },
                { label: t("publicReviews"), value: String(counts.publicReviews), hint: t("publicHint") },
                { label: t("privateFeedback"), value: String(counts.privateFeedback), hint: t("privateHint") },
              ]}
            />
            {reviews.length ? (
              <div className="max-w-sm">
                <Label htmlFor="ravelo-search">{tCommon("searchRecords")}</Label>
                <Input id="ravelo-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchPlaceholder")} />
              </div>
            ) : null}
          </AdvancedPanel>
        </div>
        <div className="flex flex-col gap-4 md:col-span-2">
          <FormError message={error} />
          <PrimaryAction pending={pending}>{pending ? t("adding") : t("add")}</PrimaryAction>
          <ActionFeedback message={saved} />
        </div>
      </form>

      <div className="mt-12">
        {reviews.length === 0 ? (
          <EmptyState className="py-20" title={t("emptyTitle")} description={t("emptyBody")} />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>{t("colCustomer")}</TH>
                <TH>{t("colChannel")}</TH>
                <TH>{t("colStatus")}</TH>
                <TH>{t("colFollowUp")}</TH>
                <TH>{t("colConnected")}</TH>
                <TH className="text-right"> </TH>
              </TR>
            </THead>
            <TBody>
              {visible.map((item) => (
                <TR key={item.id} id={`review-${item.id}`} className={cn(focusReviewId === item.id && "bg-accent-soft")}>
                  <TD>
                    <p className="font-medium">{item.customer_name}</p>
                    <p className="text-xs text-muted">
                      {item.rating ? `${item.rating}/5` : t("noRating")}
                      {item.feedback ? ` · ${item.feedback}` : ""}
                    </p>
                  </TD>
                  <TD>
                    <p>{t(channelKeys[item.channel])}</p>
                    {item.review_url ? (
                      <a className="text-xs text-muted hover:text-accent" href={item.review_url} target="_blank" rel="noreferrer">
                        {t("openLink")}
                      </a>
                    ) : null}
                  </TD>
                  <TD>
                    <Badge tone={statusTone[item.status]}>{t(statusKeys[item.status])}</Badge>
                    <select
                      aria-label={t("statusFor", { name: item.customer_name })}
                      className="mt-2 block h-9 rounded-md border border-foreground/15 bg-card px-2 text-sm"
                      defaultValue={item.status}
                      onChange={async (event) => {
                        const result = await updateReviewStatus(item.id, event.target.value);
                        toast({ title: result.ok ? t("statusUpdated") : result.error, tone: result.ok ? "success" : "error" });
                        if (result.ok) router.refresh();
                      }}
                    >
                      {reviewStatuses.map((status) => (
                        <option key={status} value={status}>{t(statusKeys[status])}</option>
                      ))}
                    </select>
                  </TD>
                  <TD>
                    <input
                      type="date"
                      aria-label={t("followUpFor", { name: item.customer_name })}
                      defaultValue={item.next_follow_up_on ?? ""}
                      disabled={!isOpen(item)}
                      className="h-9 rounded-md border border-foreground/15 bg-card px-2 text-sm"
                      onChange={async (event) => {
                        const result = await updateReviewFollowUp(item.id, event.target.value);
                        toast({ title: result.ok ? t("followUpSaved") : result.error, tone: result.ok ? "success" : "error" });
                        if (result.ok) router.refresh();
                      }}
                    />
                  </TD>
                  <TD>
                    <ConnectedRecords
                      product="ravelo"
                      recordId={item.id}
                      links={links}
                      leads={leads}
                      bookings={bookings}
                      quotes={quotes}
                      invoices={invoices}
                      reactivations={reactivations}
                      reviews={reviews}
                    />
                  </TD>
                  <TD className="text-right">
                    <TrashButton label={t("remove")} onClick={() => setDeleteId(item.id)} />
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </div>
      <ConfirmationDialog
        open={Boolean(deleteId)}
        title={t("removeTitle")}
        description={t("removeBody")}
        confirmLabel={t("remove")}
        cancelLabel={tCommon("cancel")}
        danger
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return;
          const result = await deleteReview(deleteId);
          setDeleteId(null);
          toast({ title: result.ok ? t("removed") : result.error, tone: result.ok ? "success" : "error" });
          if (result.ok) router.refresh();
        }}
      />
    </div>
  );
}
