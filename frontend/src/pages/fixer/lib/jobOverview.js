export function getFixerJobOverview(job, bookingId) {
  if (!job) {
    return null;
  }

  const normalizedStatus = String(job.status || "").toLowerCase();
  const totalSource =
    normalizedStatus === "complete"
      ? job.receipt_total ?? job.proposal_total ?? job.service_fee
      : job.proposal_total ?? job.service_fee;

  return (
    job.job_overview || {
      total_estimated_price: Number(totalSource || 0),
      issue_description: job.issue_description || "No issue description available.",
      booking_reference: bookingId ? String(bookingId) : "",
      category: job.category_name || "Service Request",
      category_image: job.category_image || "",
    }
  );
}
