import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Expert 1: Nguyễn Trần Thi Văn
  const expert1 = await prisma.expert.create({
    data: {
      fullName: "Nguyễn Trần Thi Văn",
      birthYear: 1980,
      gender: "Nam",
      degree: "Thạc sĩ",
      organization: "Đại học Sư phạm kỹ thuật TPHCM",
      educations: {
        create: [
          { year: 2002, school: "Đại học Khoa học Tự nhiên - ĐHQG TPHCM", major: "Công nghệ thông tin" },
          { year: 2003, school: "ĐH KHXH&NV - ĐHQG TPHCM", major: "Anh văn" },
          { year: 2015, school: "ĐH Công nghệ thông tin - ĐHQG TPHCM", major: "Khoa học Máy tính" }
        ]
      },
      workHistories: {
        create: [
          {
            startYear: 2003,
            endYear: 2017,
            position: "Giảng viên",
            workplace: "Đại học Sư phạm kỹ thuật TPHCM",
            field: "Công nghệ thông tin"
          }
        ]
      },
      publications: {
        create: [
          {
            year: 2016,
            place: "Nhà xuất bản Đại học Quốc Gia TPHCM",
            title: "Lập trình truyền thông Linux",
            type: "Sách chuyên khảo",
            author: "Đồng tác giả"
          }
        ]
      },
      languages: {
        create: [
          {
            language: "Tiếng Anh",
            listening: "Tốt",
            speaking: "Tốt",
            reading: "Tốt",
            writing: "Tốt"
          }
        ]
      }
    }
  });

  // Expert 2: Trương Quang Phúc
  const expert2 = await prisma.expert.create({
    data: {
      fullName: "Trương Quang Phúc",
      birthYear: 1988,
      gender: "Nam",
      degree: "Thạc sĩ",
      organization: "Đại học Sư phạm kỹ thuật TPHCM",
      educations: {
        create: [
          { year: 2011, school: "ĐH SPKT TPHCM", major: "Điện tử - Viễn thông" },
          { year: 2014, school: "ĐH SPKT TPHCM", major: "Kỹ thuật Điện tử" }
        ]
      },
      workHistories: {
        create: [
          {
            startYear: 2012,
            endYear: 2017,
            position: "Giảng viên",
            workplace: "ĐH SPKT TPHCM",
            field: "Kỹ thuật máy tính viễn thông"
          }
        ]
      },
      publications: {
        create: [
          {
            year: 2014,
            place: "GTSD 14",
            title: "The implementation of LPC Algorithm (LPC 10e) on TMS 320C6713",
            type: "Hội nghị quốc tế",
            author: "Đồng tác giả"
          },
          {
            year: 2015,
            place: "NICS 2015",
            title: "On the energy efficiency of NOMA for wireless backhaul in multi-tier heterogeneous CRAN",
            type: "Hội nghị quốc tế",
            author: "Đồng tác giả"
          },
          {
            year: 2017,
            place: "Sigtelcom 2017",
            title: "SVM algorithm for human fall recognition using Kinect-based skeletal data",
            type: "Hội nghị quốc tế",
            author: "Đồng tác giả"
          }
        ]
      },
      projects: {
        create: [
          { startYear: 2014, endYear: 2014, title: "Nghiên cứu mô hình hệ thống nhúng điều khiển tín hiệu đèn giao thông" },
          { startYear: 2014, endYear: 2014, title: "Nghiên cứu mô hình hệ thống nhúng động quan trắc và thông tin mực nước" },
          { startYear: 2015, endYear: 2015, title: "Nghiên cứu các phần mềm mô phỏng Anter", status: "Đã nghiệm thu", role: "Chủ nhiệm" },
          { startYear: 2015, endYear: 2015, title: "Phân tích tín hiệu JNIRS cho sự tăng cường việc tiên đoán vùng não tương ứng với hoạt động" },
          { startYear: 2017, endYear: 2018, title: "Thiết kế chế tạo thiết bị phụ trợ in kỹ thuật số trong công nghiệp" }
        ]
      },
      languages: {
        create: [
          {
            language: "Tiếng Anh",
            listening: "Khá",
            speaking: "Khá",
            reading: "Khá",
            writing: "Khá"
          }
        ]
      }
    }
  });

  // Expert 3: Nguyễn Thái Anh
  const expert3 = await prisma.expert.create({
    data: {
      fullName: "Nguyễn Thái Anh",
      birthYear: 1983,
      gender: "Nam",
      degree: "Tiến sĩ",
      organization: "Đại học Sư phạm kỹ thuật TPHCM",
      educations: {
        create: [
          { year: 2006, school: "ĐH Bách khoa TPHCM", major: "Kỹ thuật môi trường" },
          { year: 2011, school: "ĐH Bách khoa TPHCM", major: "Quản lý môi trường" },
          { year: 2016, school: "ĐH Nguyên Trí, Đài Loan", major: "Kỹ thuật môi trường" }
        ]
      },
      workHistories: {
        create: [
          {
            startYear: 2006,
            endYear: 2009,
            position: "Nhân viên môi trường",
            workplace: "Công ty CP Đầu tư xây dựng Bình Chánh (BCCI), KCN Lê Minh Xuân",
            field: "Giám sát quản lý chất lượng môi trường. Quản lý chất lượng (QA)"
          },
          {
            startYear: 2009,
            endYear: 2010,
            position: "Kỹ sư môi trường",
            workplace: "Công ty CP Kỹ thuật SEEN",
            field: "Thiết kế công nghệ. Quản lý vận hành nhà máy xử lý nước thải"
          },
          {
            startYear: 2010,
            endYear: 2011,
            position: "Chuyên viên SHE",
            workplace: "Công ty CP VINAMIT",
            field: "Quản lý an toàn, sức khỏe, môi trường cho các dự án"
          },
          {
            startYear: 2011,
            endYear: 2017,
            position: "Giảng viên",
            workplace: "ĐH SPKT TPHCM",
            field: "Giảng dạy và nghiên cứu khoa học"
          }
        ]
      },
      publications: {
        create: [
          {
            year: 2016,
            place: "Chemical Engineering Journal",
            title: "Effective removal of sulfurdyes from water by biosorption and subsequent immobilized Laccase",
            type: "Tạp chí quốc tế",
            author: "Ruey-Shi Juang"
          },
          {
            year: 2016,
            place: "Journal of Environmental Management",
            title: "Biosorption & biodegradation of a sulfur in high-strength dyeing wastewater",
            type: "Tạp chí quốc tế",
            author: "Ruey-Shi Juang"
          }
        ]
      },
      languages: {
        create: [
          {
            language: "Tiếng Anh",
            listening: "Khá",
            speaking: "Khá",
            reading: "Khá",
            writing: "Khá"
          }
        ]
      }
    }
  });
}

main()
  .then(() => {
    console.log("✅ Seed completed.");
  })
  .catch((e) => {
    console.error("❌ Seed failed: ", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
