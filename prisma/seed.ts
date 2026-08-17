import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Eduvora database...');

  // 1. Create Institution
  const inst = await prisma.institution.upsert({
    where: { code: 'EDUVORA-MAIN' },
    update: {},
    create: {
      name: 'Eduvora Global Academy',
      type: 'School & Academy',
      code: 'EDUVORA-MAIN',
      logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200',
      address: '124 Academic Parkway, Suite 500, Education City',
      phone: '+1 (555) 234-5678',
      email: 'info@eduvora.edu',
      website: 'https://eduvora.vercel.app',
    },
  });

  // 2. Create Branch
  const mainBranch = await prisma.branch.create({
    data: {
      institutionId: inst.id,
      name: 'Main Campus',
      code: 'CAMPUS-01',
      address: '124 Academic Parkway, Education City',
      phone: '+1 (555) 234-5678',
      isMain: true,
    },
  });

  // 3. Create Users for Roles
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@eduvora.edu' },
    update: {},
    create: {
      institutionId: inst.id,
      branchId: mainBranch.id,
      name: 'Dr. Arthur Pendelton',
      email: 'admin@eduvora.edu',
      password: 'password123', // In production use bcrypt
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
      phone: '+1 (555) 901-2345',
    },
  });

  const teacherUser = await prisma.user.upsert({
    where: { email: 'teacher@eduvora.edu' },
    update: {},
    create: {
      institutionId: inst.id,
      branchId: mainBranch.id,
      name: 'Prof. Sarah Jenkins',
      email: 'teacher@eduvora.edu',
      password: 'password123',
      role: 'TEACHER',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
      phone: '+1 (555) 890-1234',
    },
  });

  const accountantUser = await prisma.user.upsert({
    where: { email: 'accountant@eduvora.edu' },
    update: {},
    create: {
      institutionId: inst.id,
      branchId: mainBranch.id,
      name: 'Robert Sterling',
      email: 'accountant@eduvora.edu',
      password: 'password123',
      role: 'ACCOUNTANT',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150',
      phone: '+1 (555) 789-0123',
    },
  });

  const receptionistUser = await prisma.user.upsert({
    where: { email: 'reception@eduvora.edu' },
    update: {},
    create: {
      institutionId: inst.id,
      branchId: mainBranch.id,
      name: 'Emily Watson',
      email: 'reception@eduvora.edu',
      password: 'password123',
      role: 'RECEPTIONIST',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
      phone: '+1 (555) 678-9012',
    },
  });

  const parentUser = await prisma.user.upsert({
    where: { email: 'parent@eduvora.edu' },
    update: {},
    create: {
      institutionId: inst.id,
      branchId: mainBranch.id,
      name: 'Michael Vance',
      email: 'parent@eduvora.edu',
      password: 'password123',
      role: 'PARENT',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      phone: '+1 (555) 567-8901',
    },
  });

  // 4. Create Parent Profile
  const parentProfile = await prisma.parent.create({
    data: {
      institutionId: inst.id,
      userId: parentUser.id,
      name: 'Michael Vance',
      relationship: 'Father',
      contact: '+1 (555) 567-8901',
      email: 'parent@eduvora.edu',
      address: '742 Evergreen Terrace, Springfield',
      occupation: 'Software Architect',
    },
  });

  // 5. Create Academic Sessions
  const session2025 = await prisma.academicSession.create({
    data: {
      institutionId: inst.id,
      name: '2025-2026',
      startDate: '2025-08-01',
      endDate: '2026-06-30',
      isCurrent: false,
      status: 'ARCHIVED',
    },
  });

  const session2026 = await prisma.academicSession.create({
    data: {
      institutionId: inst.id,
      name: '2026-2027',
      startDate: '2026-08-01',
      endDate: '2027-06-30',
      isCurrent: true,
      status: 'ACTIVE',
    },
  });

  // 6. Create Teachers
  const teacher1 = await prisma.teacher.create({
    data: {
      institutionId: inst.id,
      branchId: mainBranch.id,
      userId: teacherUser.id,
      teacherId: 'TCH-2026-001',
      name: 'Prof. Sarah Jenkins',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
      email: 'teacher@eduvora.edu',
      phone: '+1 (555) 890-1234',
      address: '12 Oak Ridge Rd',
      qualification: 'M.Sc. Advanced Mathematics',
      joiningDate: '2021-08-15',
      salary: 4500,
      status: 'ACTIVE',
    },
  });

  const teacher2 = await prisma.teacher.create({
    data: {
      institutionId: inst.id,
      branchId: mainBranch.id,
      teacherId: 'TCH-2026-002',
      name: 'Dr. David Miller',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      email: 'david.m@eduvora.edu',
      phone: '+1 (555) 432-1098',
      address: '88 Pine Street',
      qualification: 'Ph.D. Quantum Physics',
      joiningDate: '2019-01-10',
      salary: 5200,
      status: 'ACTIVE',
    },
  });

  const teacher3 = await prisma.teacher.create({
    data: {
      institutionId: inst.id,
      branchId: mainBranch.id,
      teacherId: 'TCH-2026-003',
      name: 'Elena Rostova',
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
      email: 'elena.r@eduvora.edu',
      phone: '+1 (555) 321-0987',
      address: '45 Maple Ave',
      qualification: 'M.A. English Literature',
      joiningDate: '2022-09-01',
      salary: 4100,
      status: 'ACTIVE',
    },
  });

  // 7. Create Classes & Sections
  const class10 = await prisma.class.create({
    data: {
      institutionId: inst.id,
      name: 'Grade 10 Science',
      code: 'G10-SCI',
      classTeacherId: teacher1.id,
    },
  });

  const class9 = await prisma.class.create({
    data: {
      institutionId: inst.id,
      name: 'Grade 9 General',
      code: 'G9-GEN',
      classTeacherId: teacher2.id,
    },
  });

  const classBSCS = await prisma.class.create({
    data: {
      institutionId: inst.id,
      name: 'BS Computer Science Yr 1',
      code: 'BSCS-Y1',
      classTeacherId: teacher3.id,
    },
  });

  const sec10A = await prisma.section.create({
    data: { classId: class10.id, name: 'Section A', capacity: 35 },
  });

  const sec10B = await prisma.section.create({
    data: { classId: class10.id, name: 'Section B', capacity: 35 },
  });

  const sec9A = await prisma.section.create({
    data: { classId: class9.id, name: 'Section A', capacity: 40 },
  });

  const secBS1 = await prisma.section.create({
    data: { classId: classBSCS.id, name: 'Alpha', capacity: 50 },
  });

  // 8. Create Subjects
  const subMath = await prisma.subject.create({
    data: { institutionId: inst.id, name: 'Advanced Mathematics', code: 'MATH-101', type: 'Core' },
  });

  const subPhys = await prisma.subject.create({
    data: { institutionId: inst.id, name: 'Physics & Lab', code: 'PHYS-201', type: 'Core' },
  });

  const subEng = await prisma.subject.create({
    data: { institutionId: inst.id, name: 'English Composition', code: 'ENG-102', type: 'Core' },
  });

  const subCS = await prisma.subject.create({
    data: { institutionId: inst.id, name: 'Data Structures & Algorithms', code: 'CS-301', type: 'Practical' },
  });

  // Map Class Subjects
  await prisma.classSubject.createMany({
    data: [
      { classId: class10.id, subjectId: subMath.id, teacherId: teacher1.id },
      { classId: class10.id, subjectId: subPhys.id, teacherId: teacher2.id },
      { classId: class10.id, subjectId: subEng.id, teacherId: teacher3.id },
      { classId: classBSCS.id, subjectId: subCS.id, teacherId: teacher1.id },
    ],
  });

  // 9. Create Students
  const studentDataList = [
    {
      studentId: 'STU-2026-001',
      admissionNo: 'ADM-2026-101',
      firstName: 'Lucas',
      lastName: 'Vance',
      gender: 'Male',
      dob: '2010-04-12',
      phone: '+1 (555) 111-2222',
      email: 'lucas.vance@student.eduvora.edu',
      classId: class10.id,
      sectionId: sec10A.id,
      rollNo: '101',
      parentId: parentProfile.id,
      photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150',
    },
    {
      studentId: 'STU-2026-002',
      admissionNo: 'ADM-2026-102',
      firstName: 'Sophia',
      lastName: 'Vance',
      gender: 'Female',
      dob: '2012-09-21',
      phone: '+1 (555) 111-3333',
      email: 'sophia.vance@student.eduvora.edu',
      classId: class9.id,
      sectionId: sec9A.id,
      rollNo: '901',
      parentId: parentProfile.id,
      photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
    },
    {
      studentId: 'STU-2026-003',
      admissionNo: 'ADM-2026-103',
      firstName: 'Ethan',
      lastName: 'Hawke',
      gender: 'Male',
      dob: '2010-01-15',
      phone: '+1 (555) 222-3333',
      email: 'ethan.h@student.eduvora.edu',
      classId: class10.id,
      sectionId: sec10A.id,
      rollNo: '102',
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
    },
    {
      studentId: 'STU-2026-004',
      admissionNo: 'ADM-2026-104',
      firstName: 'Chloe',
      lastName: 'Bennett',
      gender: 'Female',
      dob: '2009-11-30',
      phone: '+1 (555) 333-4444',
      email: 'chloe.b@student.eduvora.edu',
      classId: class10.id,
      sectionId: sec10B.id,
      rollNo: '103',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    },
    {
      studentId: 'STU-2026-005',
      admissionNo: 'ADM-2026-105',
      firstName: 'Liam',
      lastName: 'Neeson',
      gender: 'Male',
      dob: '2007-06-18',
      phone: '+1 (555) 444-5555',
      email: 'liam.n@student.eduvora.edu',
      classId: classBSCS.id,
      sectionId: secBS1.id,
      rollNo: 'CS-01',
      photo: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=150',
    },
  ];

  const createdStudents = [];
  for (const s of studentDataList) {
    const st = await prisma.student.create({
      data: {
        institutionId: inst.id,
        branchId: mainBranch.id,
        sessionId: session2026.id,
        admissionDate: '2026-08-01',
        status: 'ACTIVE',
        address: '100 Academy Row, Cityville',
        ...s,
      },
    });
    createdStudents.push(st);
  }

  // 10. Create Staff Members
  await prisma.staff.createMany({
    data: [
      {
        institutionId: inst.id,
        branchId: mainBranch.id,
        staffId: 'STF-2026-001',
        name: 'Robert Sterling',
        role: 'Accountant',
        email: 'accountant@eduvora.edu',
        phone: '+1 (555) 789-0123',
        address: '32 Wall St',
        joiningDate: '2020-03-01',
        salary: 3800,
        status: 'ACTIVE',
      },
      {
        institutionId: inst.id,
        branchId: mainBranch.id,
        staffId: 'STF-2026-002',
        name: 'Emily Watson',
        role: 'Receptionist',
        email: 'reception@eduvora.edu',
        phone: '+1 (555) 678-9012',
        address: '15 Ocean Ave',
        joiningDate: '2022-01-15',
        salary: 2900,
        status: 'ACTIVE',
      },
      {
        institutionId: inst.id,
        branchId: mainBranch.id,
        staffId: 'STF-2026-003',
        name: 'Marcus Brody',
        role: 'Security Chief',
        phone: '+1 (555) 999-8888',
        address: '77 Fortress Way',
        joiningDate: '2018-05-10',
        salary: 2400,
        status: 'ACTIVE',
      },
      {
        institutionId: inst.id,
        branchId: mainBranch.id,
        staffId: 'STF-2026-004',
        name: 'James Corden',
        role: 'Transport Driver',
        phone: '+1 (555) 777-6666',
        address: '5 Route 66',
        joiningDate: '2021-11-20',
        salary: 2200,
        status: 'ACTIVE',
      },
    ],
  });

  // 11. Create Fee Types & Invoices & Payments
  const feeMonthly = await prisma.feeType.create({
    data: { institutionId: inst.id, name: 'Monthly Tuition Fee', description: 'Standard monthly academic tuition' },
  });

  const feeAdmission = await prisma.feeType.create({
    data: { institutionId: inst.id, name: 'Admission Fee', description: 'One-time initial enrollment fee' },
  });

  const feeExam = await prisma.feeType.create({
    data: { institutionId: inst.id, name: 'Examination Fee', description: 'Term exam & paper evaluation fee' },
  });

  // Invoices for Lucas Vance
  const inv1 = await prisma.feeInvoice.create({
    data: {
      institutionId: inst.id,
      studentId: createdStudents[0].id,
      invoiceNo: 'INV-2026-001',
      feeTypeId: feeMonthly.id,
      title: 'August 2026 Tuition Fee',
      amount: 450,
      paidAmount: 450,
      dueDate: '2026-08-10',
      sessionId: session2026.id,
      status: 'PAID',
    },
  });

  await prisma.payment.create({
    data: {
      institutionId: inst.id,
      invoiceId: inv1.id,
      receiptNo: 'RCP-2026-8801',
      amountPaid: 450,
      paymentDate: '2026-08-05',
      paymentMethod: 'ONLINE',
      transactionRef: 'TXN-98402198',
    },
  });

  const inv2 = await prisma.feeInvoice.create({
    data: {
      institutionId: inst.id,
      studentId: createdStudents[0].id,
      invoiceNo: 'INV-2026-002',
      feeTypeId: feeExam.id,
      title: 'Mid-Term Examination Fee',
      amount: 150,
      paidAmount: 50,
      dueDate: '2026-08-25',
      sessionId: session2026.id,
      status: 'PARTIAL',
    },
  });

  await prisma.payment.create({
    data: {
      institutionId: inst.id,
      invoiceId: inv2.id,
      receiptNo: 'RCP-2026-8802',
      amountPaid: 50,
      paymentDate: '2026-08-12',
      paymentMethod: 'CASH',
    },
  });

  // Invoice for Sophia Vance
  const inv3 = await prisma.feeInvoice.create({
    data: {
      institutionId: inst.id,
      studentId: createdStudents[1].id,
      invoiceNo: 'INV-2026-003',
      feeTypeId: feeMonthly.id,
      title: 'August 2026 Tuition Fee',
      amount: 400,
      paidAmount: 400,
      dueDate: '2026-08-10',
      sessionId: session2026.id,
      status: 'PAID',
    },
  });

  await prisma.payment.create({
    data: {
      institutionId: inst.id,
      invoiceId: inv3.id,
      receiptNo: 'RCP-2026-8803',
      amountPaid: 400,
      paymentDate: '2026-08-08',
      paymentMethod: 'BANK_TRANSFER',
      transactionRef: 'WIRE-330192',
    },
  });

  // Invoice Overdue for Ethan Hawke
  await prisma.feeInvoice.create({
    data: {
      institutionId: inst.id,
      studentId: createdStudents[2].id,
      invoiceNo: 'INV-2026-004',
      feeTypeId: feeMonthly.id,
      title: 'August 2026 Tuition Fee',
      amount: 450,
      paidAmount: 0,
      dueDate: '2026-08-01',
      sessionId: session2026.id,
      status: 'OVERDUE',
    },
  });

  // 12. Create Expenses
  await prisma.expense.createMany({
    data: [
      {
        institutionId: inst.id,
        expenseNo: 'EXP-2026-001',
        title: 'Electricity & Power Bill - July',
        category: 'ELECTRICITY',
        amount: 1420,
        date: '2026-08-02',
        paymentMethod: 'BANK_TRANSFER',
        description: 'Monthly utility power supply bill',
      },
      {
        institutionId: inst.id,
        expenseNo: 'EXP-2026-002',
        title: 'High-Speed Fiber Internet Upgrade',
        category: 'INTERNET',
        amount: 350,
        date: '2026-08-04',
        paymentMethod: 'CARD',
        description: 'Campus 1Gbps dedicated line connection',
      },
      {
        institutionId: inst.id,
        expenseNo: 'EXP-2026-003',
        title: 'Science Lab Chemicals & Equipment',
        category: 'EQUIPMENT',
        amount: 890,
        date: '2026-08-10',
        paymentMethod: 'CASH',
        description: 'Reagents, test tubes, and safety goggles',
      },
      {
        institutionId: inst.id,
        expenseNo: 'EXP-2026-004',
        title: 'Paper, Printing & Exam Supplies',
        category: 'STATIONERY',
        amount: 620,
        date: '2026-08-14',
        paymentMethod: 'CASH',
        description: 'A4 reams, toner cartridges, answer booklets',
      },
    ],
  });

  // 13. Create Salaries
  await prisma.salary.create({
    data: {
      institutionId: inst.id,
      staffType: 'TEACHER',
      teacherId: teacher1.id,
      month: 'July',
      year: 2026,
      baseSalary: 4500,
      bonus: 300,
      deduction: 100,
      advance: 0,
      netSalary: 4700,
      status: 'PAID',
      paidDate: '2026-08-01',
      paymentMethod: 'BANK_TRANSFER',
      salarySlipNo: 'SLIP-2026-701',
    },
  });

  await prisma.salary.create({
    data: {
      institutionId: inst.id,
      staffType: 'TEACHER',
      teacherId: teacher2.id,
      month: 'July',
      year: 2026,
      baseSalary: 5200,
      bonus: 0,
      deduction: 150,
      advance: 200,
      netSalary: 4850,
      status: 'PAID',
      paidDate: '2026-08-01',
      paymentMethod: 'BANK_TRANSFER',
      salarySlipNo: 'SLIP-2026-702',
    },
  });

  // 14. Attendance records for current date & past days
  const today = '2026-08-17';
  await prisma.attendance.createMany({
    data: [
      { institutionId: inst.id, studentId: createdStudents[0].id, sectionId: sec10A.id, date: today, status: 'PRESENT', sessionId: session2026.id },
      { institutionId: inst.id, studentId: createdStudents[1].id, sectionId: sec9A.id, date: today, status: 'PRESENT', sessionId: session2026.id },
      { institutionId: inst.id, studentId: createdStudents[2].id, sectionId: sec10A.id, date: today, status: 'ABSENT', remarks: 'Sick leave requested by parent', sessionId: session2026.id },
      { institutionId: inst.id, studentId: createdStudents[3].id, sectionId: sec10B.id, date: today, status: 'LATE', remarks: 'Arrived 15 mins late due to traffic', sessionId: session2026.id },
      { institutionId: inst.id, studentId: createdStudents[4].id, sectionId: secBS1.id, date: today, status: 'PRESENT', sessionId: session2026.id },
    ],
  });

  // 15. Create Timetable entries
  await prisma.timetable.createMany({
    data: [
      {
        institutionId: inst.id,
        classId: class10.id,
        sectionId: sec10A.id,
        subjectId: subMath.id,
        teacherId: teacher1.id,
        room: 'Lab 201',
        dayOfWeek: 'MONDAY',
        startTime: '08:30',
        endTime: '09:30',
      },
      {
        institutionId: inst.id,
        classId: class10.id,
        sectionId: sec10A.id,
        subjectId: subPhys.id,
        teacherId: teacher2.id,
        room: 'Science Lab 3',
        dayOfWeek: 'MONDAY',
        startTime: '09:30',
        endTime: '10:30',
      },
      {
        institutionId: inst.id,
        classId: class10.id,
        sectionId: sec10A.id,
        subjectId: subEng.id,
        teacherId: teacher3.id,
        room: 'Room 104',
        dayOfWeek: 'MONDAY',
        startTime: '10:45',
        endTime: '11:45',
      },
    ],
  });

  // 16. Admissions applications
  await prisma.admission.createMany({
    data: [
      {
        institutionId: inst.id,
        applicationNo: 'APP-2026-901',
        applicantName: 'Oliver Twist',
        dob: '2011-03-05',
        gender: 'Male',
        phone: '+1 (555) 444-1234',
        email: 'oliver.parent@gmail.com',
        address: '99 Orphanage Lane',
        targetClassId: class9.id,
        parentName: 'Mr. Brownlow',
        parentPhone: '+1 (555) 444-1234',
        admissionFee: 500,
        status: 'PENDING',
        appliedDate: '2026-08-14',
      },
      {
        institutionId: inst.id,
        applicationNo: 'APP-2026-902',
        applicantName: 'Hannah Montana',
        dob: '2010-07-22',
        gender: 'Female',
        phone: '+1 (555) 888-9999',
        email: 'robby.ray@gmail.com',
        address: '10 Malibu Beach',
        targetClassId: class10.id,
        parentName: 'Robby Ray Stewart',
        parentPhone: '+1 (555) 888-9999',
        admissionFee: 550,
        status: 'APPROVED',
        appliedDate: '2026-08-15',
      },
    ],
  });

  // 17. Exams, Schedules & Results
  const midExam = await prisma.exam.create({
    data: {
      institutionId: inst.id,
      sessionId: session2026.id,
      name: 'Mid-Term Examinations 2026',
      type: 'MID_TERM',
      startDate: '2026-09-10',
      endDate: '2026-09-20',
    },
  });

  const mathSched = await prisma.examSchedule.create({
    data: {
      examId: midExam.id,
      classId: class10.id,
      subjectId: subMath.id,
      examDate: '2026-09-12',
      startTime: '09:00',
      durationMinutes: 120,
      totalMarks: 100,
      passingMarks: 40,
      room: 'Main Examination Hall',
    },
  });

  await prisma.mark.create({
    data: {
      examScheduleId: mathSched.id,
      studentId: createdStudents[0].id,
      marksObtained: 94,
      grade: 'A+',
      remarks: 'Outstanding logical speed',
    },
  });

  await prisma.result.create({
    data: {
      examId: midExam.id,
      studentId: createdStudents[0].id,
      totalMarks: 100,
      obtainedMarks: 94,
      percentage: 94.0,
      grade: 'A+',
      rank: 1,
      status: 'PASS',
    },
  });

  // 18. Announcements & Notifications
  await prisma.announcement.createMany({
    data: [
      {
        institutionId: inst.id,
        title: 'Annual Sports Gala Registration Open',
        content: 'Students from Grade 9 through BS Computer Science can now submit entry forms for track and field events.',
        targetAudience: 'ALL',
        priority: 'HIGH',
      },
      {
        institutionId: inst.id,
        title: 'Grade 10 Parent-Teacher Conference',
        content: 'Parent-Teacher conference will take place this Friday in the Auditorium starting 2:00 PM.',
        targetAudience: 'PARENTS',
        targetClassId: class10.id,
        priority: 'URGENT',
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: parentUser.id,
        title: 'Fee Payment Received',
        message: 'Your payment of $450 for August 2026 Tuition Fee (Receipt #RCP-2026-8801) was successfully processed.',
        type: 'FEE',
      },
      {
        userId: adminUser.id,
        title: 'New Admission Application Received',
        message: 'Application APP-2026-901 for Oliver Twist submitted for Grade 9.',
        type: 'SYSTEM',
      },
    ],
  });

  // 19. Documents
  await prisma.document.createMany({
    data: [
      {
        institutionId: inst.id,
        entityType: 'STUDENT',
        entityId: createdStudents[0].id,
        title: 'Birth Certificate - Lucas Vance',
        category: 'BIRTH_CERTIFICATE',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: '1.2 MB',
        fileType: 'pdf',
      },
      {
        institutionId: inst.id,
        entityType: 'TEACHER',
        entityId: teacher1.id,
        title: 'Employment Contract & Academic Degree',
        category: 'CONTRACT',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: '2.5 MB',
        fileType: 'pdf',
      },
    ],
  });

  console.log('✅ Eduvora Database Seeded Successfully with complete real data!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
