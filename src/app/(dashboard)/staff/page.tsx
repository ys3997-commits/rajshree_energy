import { listStaff } from "@/lib/actions/staff";
import { StaffClient } from "./StaffClient";

export default async function StaffPage() {
  const rows = await listStaff();
  return <StaffClient initial={rows} />;
}
