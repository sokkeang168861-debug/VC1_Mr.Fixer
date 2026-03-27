export function getFixerJobOverview(job, bookingId) {
  if (!job) {
    return null;
  }

  return (
    job.job_overview || {
      total_estimated_price: Number(job.service_fee || 0),
      issue_description: job.issue_description || "No issue description available.",
      booking_reference: bookingId ? String(bookingId) : "",
      category: job.category_name || "Service Request",
    }
  );
}
