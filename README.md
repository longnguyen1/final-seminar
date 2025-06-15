# Expert Dashboard

## Tech Stack
- Next.js 15 (App Router)
- Prisma + MySQL
- NextAuth (Credentials + Prisma Adapter)
- Tailwind CSS 3.4.3
- React Hooks, Fetch API

## Chạy local
1. `npm install`  
2. Tạo file `.env` với `DATABASE_URL=…`  
3. `npx prisma migrate dev`  
4. `npm run seed`  
5. `npm run dev`

## Cấu trúc chính
/
├── prisma/
│   ├── schema.prisma        # Định nghĩa toàn bộ các model: Expert, Education, WorkHistory, Publication, Project, Language, User…
│   └── seed.ts              # Script tạo dữ liệu mẫu (3 chuyên gia + admin user)
│
├── lib/
│   └── prisma.ts            # Khởi tạo và export 1 singleton PrismaClient
│
├── app/
│   ├── globals.css          # Tailwind base / components / utilities
│   ├── layout.tsx           # RootLayout chung cho toàn app
│   │
│   ├── api/                  # Tất cả API routes (App Router)
│   │   ├── experts/
│   │   │   ├── route.ts            # GET all, POST new
│   │   │   └── [id]/
│   │   │       ├── route.ts        # GET by id, PUT, DELETE soft
│   │   │       ├── undelete/route.ts
│   │   │       └── educations/
│   │   │           └── route.ts    # GET /api/experts/:id/educations
│   │   │       …                    # workHistories/, publications/, projects/, languages/ tương tự
│   │   ├── educations/…     # CRUD riêng lẻ: /api/educations, /api/educations/[id], undelete
│   │   ├── workHistories/…
│   │   ├── publications/…
│   │   ├── projects/…
│   │   ├── languages/…
│   │   └── auth/[…nextauth]       # NextAuth route.ts
│   │
│   └── admin/               # Toàn bộ giao diện admin
│       ├── page.tsx         # /admin → ExpertTable
│       └── experts/
│           ├── page.tsx     # /admin/experts → danh sách + modal thêm/sửa Expert
│           ├── ExpertTable.tsx
│           ├── ExpertFormModal.tsx
│           └── [id]/
│               ├── page.tsx         # /admin/experts/[id] → DetailPage với tabs
│               └── components/
│                   ├── ExpertInfoForm.tsx
│                   ├── EducationSection.tsx
│                   ├── EducationFormModal.tsx
│                   ├── WorkHistorySection.tsx
│                   ├── WorkHistoryFormModal.tsx
│                   ├── PublicationSection.tsx
│                   ├── PublicationFormModal.tsx
│                   ├── ProjectSection.tsx
│                   ├── ProjectFormModal.tsx
│                   ├── LanguageSection.tsx
│                   └── LanguageFormModal.tsx
│
├── postcss.config.js
├── tailwind.config.js
├── package.json
└── tsconfig.json

các file quan trọng:
  prisma/schema.prisma
  app/admin/experts/[id]/page.tsx
  app/api/experts/route.ts

2. Luồng logic chính
  1. Prisma Schema & Seed
  . Định nghĩa model với soft-delete (deleted boolean).
  . Kịch bản seed.ts dùng bcrypt để tạo admin user.

  2. API (Next.js App Router)
  .Major routes under /api/experts/* để CRUD Expert và các bảng liên quan.
  .Sub‐resources /api/experts/[id]/educations, /workHistories, /publications, /projects, /languages trả về danh sách của 1 chuyên gia.
  .Soft Delete: DELETE thực chất chỉ update deleted = true, có route undelete để khôi phục.

  3. Admin UI
  . Danh sách chuyên gia (ExpertTable.tsx): fetch /api/experts, hiển thị bảng; modal thêm/sửa Expert; “xóa” (soft).
  . Detail page ([id]/page.tsx):
    .Tabs: “Thông tin chung” (form cập nhật expert), “Học vấn”, “Công tác”, “Công trình KH”, “Dự án”, “Ngoại ngữ”.

     .Mỗi section:
      . fetch dữ liệu của expertId tương ứng,
      . hiển thị table,
      . modal thêm/sửa, xóa mềm.

  4. Authentication (NextAuth)
  . Sử dụng Prisma Adapter, strategy JWT, CredentialsProvider.
  . authorize băm & so khớp password, trả về user nếu hợp lệ.
  . Tạo trang /auth/signin và /auth/signout.

3. Những bước tiếp theo & gợi ý bổ sung
  1. Triển khai role‐based access
  . Thêm field role trong User (ví dụ: “admin” vs “editor”) để chỉ cho phép admin CRUD.

  2. Validation & feedback
  . Thêm Formik or React Hook Form + Zod/Yup để validate đầu vào.
  . Hiển thị toast (e.g. react-hot-toast) cho thành công/thất bại.

  3. Biểu đồ & thống kê
  . Tích hợp chart (Chart.js) hiển thị số chuyên gia theo năm, chuyên ngành, v.v.

  4. Tối ưu performance
  . Dùng React‑query / SWR để cache & revalidate.
  . Chia nhỏ bundle, lazy‐load modal & các section tab.

  5. Triển khai
  . Deploy lên Vercel, cài CI/CD để tự động build & migrate Prisma.
