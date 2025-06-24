// app/admin/experts/page.tsx
import { redirect } from "next/navigation";

// Nếu bạn muốn hiển thị riêng danh sách tại /admin/experts,
// thay redirect bằng <ExpertTable /> tương tự file trên.
export default function ExpertsIndexPage() {
  redirect("/admin");
}
