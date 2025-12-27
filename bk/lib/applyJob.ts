export type ApplyJobValue = "web_director" | "web_designer" | "front_end_engineer";

const LS_JOB_KEY = "ktcp:apply_job";

export function setApplyJob(job: ApplyJobValue) {
  try {
    window.localStorage.setItem(LS_JOB_KEY, job);
  } catch {
    // noop
  }
}

/**
 * slug で渡したい場合用（任意）
 * 例: setApplyJobFromSlug("front-engineer")
 */
export function setApplyJobFromSlug(slug: string) {
  const map: Record<string, ApplyJobValue> = {
    "front-engineer": "front_end_engineer",
    "front-end-engineer": "front_end_engineer",
    "web-director": "web_director",
    "web-designer": "web_designer",
  };

  const job = map[slug];
  if (!job) return;
  setApplyJob(job);
}
