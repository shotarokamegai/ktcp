"use client";

import FMLink from "@/components/FMLink";

export type ApplyJobValue = "web_director" | "web_designer" | "front_end_engineer";

const LS_JOB_KEY = "ktcp:apply_job";

function setApplyJob(job: ApplyJobValue) {
  try {
    window.localStorage.setItem(LS_JOB_KEY, job);
  } catch {
    // noop
  }
}

export default function ApplyLink({
  href,
  job,
  className,
  children,
}: {
  href: string;
  job: ApplyJobValue;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <FMLink href={href} className={className} onClick={() => setApplyJob(job)}>
      {children}
    </FMLink>
  );
}
