// Utility Functions
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function formatMonth(year, month) {
  return `${year}-${month.toString().padStart(2, "0")}`
}

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

function getCurrentMonth() {
  const now = new Date()
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  }
}

function getTodayString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()
  return {
    monthKey: formatMonth(year, month),
    dayKey: day.toString(),
  }
}

function formatPhoneNumber(phone) {
  return phone.replace(/(\d{4})(\d{7})/, "$1-$2")
}

function validatePhone(phone) {
  const phoneRegex = /^\d{4}-\d{7}$/
  return phoneRegex.test(phone)
}

// LocalStorage Functions
function loadStudents() {
  try {
    const students = localStorage.getItem("students")
    return students ? JSON.parse(students) : []
  } catch (error) {
    console.error("Error loading students:", error)
    return []
  }
}

function saveStudents(students) {
  try {
    localStorage.setItem("students", JSON.stringify(students))
  } catch (error) {
    console.error("Error saving students:", error)
    showToast("Error saving students", "error")
  }
}

function loadAttendance() {
  try {
    const attendance = localStorage.getItem("attendance")
    return attendance ? JSON.parse(attendance) : {}
  } catch (error) {
    console.error("Error loading attendance:", error)
    return {}
  }
}

function saveAttendance(attendance) {
  try {
    localStorage.setItem("attendance", JSON.stringify(attendance))
  } catch (error) {
    console.error("Error saving attendance:", error)
    showToast("Error saving attendance", "error")
  }
}

// Toast Functions
function showToast(message, type = "success") {
  const toastContainer = document.getElementById("toast-container")
  const toast = document.createElement("div")
  toast.className = `toast ${type}`
  toast.textContent = message

  toastContainer.appendChild(toast)

  // Enhanced GSAP animation
  const gsap = window.gsap // Declare gsap variable
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.fromTo(
      toast,
      { x: 100, opacity: 0, scale: 0.8 },
      {
        x: 0,
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: "back.out(1.7)",
        onComplete: () => {
          // Add subtle glow effect
          gsap.to(toast, {
            boxShadow: "0 0 20px rgba(102, 126, 234, 0.3)",
            duration: 0.2,
            yoyo: true,
            repeat: 1,
          })
        },
      },
    )
  }

  // Auto remove after 4 seconds
  setTimeout(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.to(toast, {
        x: 100,
        opacity: 0,
        scale: 0.8,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => toast.remove(),
      })
    } else {
      toast.remove()
    }
  }, 4000)
}

// Modal Functions
function showModal(title, message, onConfirm) {
  const overlay = document.getElementById("modal-overlay")
  const titleEl = document.getElementById("modal-title")
  const messageEl = document.getElementById("modal-message")
  const confirmBtn = document.getElementById("modal-confirm")
  const cancelBtn = document.getElementById("modal-cancel")

  titleEl.textContent = title
  messageEl.textContent = message

  overlay.classList.add("active")

  const handleConfirm = () => {
    overlay.classList.remove("active")
    onConfirm()
    confirmBtn.removeEventListener("click", handleConfirm)
    cancelBtn.removeEventListener("click", handleCancel)
  }

  const handleCancel = () => {
    overlay.classList.remove("active")
    confirmBtn.removeEventListener("click", handleConfirm)
    cancelBtn.removeEventListener("click", handleCancel)
  }

  confirmBtn.addEventListener("click", handleConfirm)
  cancelBtn.addEventListener("click", handleCancel)
}

// App State
let currentEditingStudent = null
let students = loadStudents()
const attendance = loadAttendance()

// Tab Management
function initTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn")
  const tabPanels = document.querySelectorAll(".tab-panel")

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.dataset.tab

      // Update active states
      tabBtns.forEach((b) => b.classList.remove("active"))
      tabPanels.forEach((p) => p.classList.remove("active"))

      btn.classList.add("active")
      const targetPanel = document.getElementById(`${targetTab}-panel`)
      targetPanel.classList.add("active")

      // Enhanced panel transition animation
      const gsap = window.gsap // Declare gsap variable
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.fromTo(
          targetPanel,
          { opacity: 0, y: 20, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.4,
            ease: "power2.out",
          },
        )

        // Animate tab button
        gsap.to(btn, {
          scale: 1.05,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut",
        })
      }

      // Initialize tab-specific content
      if (targetTab === "attendance") {
        initAttendanceTab()
      }
    })
  })
}

// Student Form Management
function initStudentForm() {
  const addBtn = document.getElementById("add-student-btn")
  const addPanel = document.getElementById("add-student-panel")
  const editPanel = document.getElementById("edit-student-panel")
  const closeAddBtn = document.getElementById("close-add-panel")
  const closeEditBtn = document.getElementById("close-edit-panel")
  const addForm = document.getElementById("add-student-form")
  const editForm = document.getElementById("edit-student-form")

  // Create overlay
  const overlay = document.createElement("div")
  overlay.className = "panel-overlay"
  overlay.id = "panel-overlay"
  document.body.appendChild(overlay)

  // Add Student Panel
  addBtn.addEventListener("click", () => {
    openPanel(addPanel)
    document.getElementById("add-name").focus()
  })

  closeAddBtn.addEventListener("click", () => closePanel(addPanel))
  overlay.addEventListener("click", () => {
    closePanel(addPanel)
    closePanel(editPanel)
  })

  // Phone number formatting for both forms
  const phoneInputs = [document.getElementById("add-phone"), document.getElementById("edit-phone")]
  phoneInputs.forEach((phoneInput) => {
    phoneInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "")
      if (value.length >= 4) {
        value = value.substring(0, 4) + "-" + value.substring(4, 11)
      }
      e.target.value = value
    })
  })

  // Add Form submission
  addForm.addEventListener("submit", (e) => {
    e.preventDefault()
    if (!validateForm("add")) return

    const studentData = {
      id: generateId(),
      name: document.getElementById("add-name").value.trim(),
      fatherName: document.getElementById("add-fatherName").value.trim(),
      phone: document.getElementById("add-phone").value.trim(),
      className: document.getElementById("add-className").value,
      feesPaid: document.getElementById("add-feesPaid").checked,
      createdAt: Date.now(),
    }

    students.push(studentData)
    saveStudents(students)
    renderStudentsTable()
    closePanel(addPanel)
    addForm.reset()
    showToast("Student added successfully")
  })

  // Edit Form submission
  editForm.addEventListener("submit", (e) => {
    e.preventDefault()
    if (!validateForm("edit")) return

    const studentData = {
      name: document.getElementById("edit-name").value.trim(),
      fatherName: document.getElementById("edit-fatherName").value.trim(),
      phone: document.getElementById("edit-phone").value.trim(),
      className: document.getElementById("edit-className").value,
      feesPaid: document.getElementById("edit-feesPaid").checked,
    }

    const index = students.findIndex((s) => s.id === currentEditingStudent.id)
    students[index] = { ...currentEditingStudent, ...studentData }
    saveStudents(students)
    renderStudentsTable()
    closePanel(editPanel)
    showToast("Student updated successfully")
  })

  closeEditBtn.addEventListener("click", () => closePanel(editPanel))

  function openPanel(panel) {
    overlay.classList.add("active")
    panel.classList.add("active")

    const gsap = window.gsap
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(panel, { x: 500, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: "power2.out" })
    }
  }

  function closePanel(panel) {
    overlay.classList.remove("active")
    panel.classList.remove("active")
    clearFormErrors()
  }

  function validateForm(type) {
    let isValid = true
    const prefix = type === "add" ? "add-" : "edit-"

    // Clear previous errors
    document
      .querySelectorAll(`#${prefix}name-error, #${prefix}fatherName-error, #${prefix}phone-error`)
      .forEach((el) => (el.textContent = ""))

    // Name validation
    const nameInput = document.getElementById(`${prefix}name`)
    if (!nameInput.value.trim()) {
      document.getElementById(`${prefix}name-error`).textContent = "Name is required"
      isValid = false
    }

    // Father name validation
    const fatherNameInput = document.getElementById(`${prefix}fatherName`)
    if (!fatherNameInput.value.trim()) {
      document.getElementById(`${prefix}fatherName-error`).textContent = "Father name is required"
      isValid = false
    }

    // Phone validation
    const phoneInput = document.getElementById(`${prefix}phone`)
    if (!phoneInput.value.trim()) {
      document.getElementById(`${prefix}phone-error`).textContent = "Phone number is required"
      isValid = false
    } else if (!validatePhone(phoneInput.value)) {
      document.getElementById(`${prefix}phone-error`).textContent = "Phone format should be 03XX-XXXXXXX"
      isValid = false
    }

    return isValid
  }

  function clearFormErrors() {
    document.querySelectorAll(".error-message").forEach((el) => (el.textContent = ""))
  }

  // Edit student function
  window.editStudent = (studentId) => {
    const student = students.find((s) => s.id === studentId)
    if (!student) return

    currentEditingStudent = student
    document.getElementById("edit-name").value = student.name
    document.getElementById("edit-fatherName").value = student.fatherName
    document.getElementById("edit-phone").value = student.phone
    document.getElementById("edit-className").value = student.className
    document.getElementById("edit-feesPaid").checked = student.feesPaid

    openPanel(editPanel)
    document.getElementById("edit-name").focus()
  }

  // Delete student function
  window.deleteStudent = (studentId) => {
    showModal(
      "Delete Student",
      "Are you sure you want to delete this student? This will also remove all attendance records.",
      () => {
        students = students.filter((s) => s.id !== studentId)

        // Remove attendance records
        if (attendance[studentId]) {
          delete attendance[studentId]
          saveAttendance(attendance)
        }

        saveStudents(students)
        renderStudentsTable()
        showToast("Student deleted successfully")
      },
    )
  }
}

// Students List Management
function initStudentsList() {
  const searchInput = document.getElementById("search-input")

  searchInput.addEventListener("input", (e) => {
    renderStudentsTable(e.target.value)
  })

  renderStudentsTable()
}

function renderStudentsTable(searchTerm = "") {
  const tableBody = document.getElementById("students-table-body")
  const emptyState = document.getElementById("empty-state")
  const tableContainer = document.querySelector(".students-table-container")

  let filteredStudents = students

  if (searchTerm) {
    const term = searchTerm.toLowerCase()
    filteredStudents = students.filter(
      (student) =>
        student.name.toLowerCase().includes(term) ||
        student.fatherName.toLowerCase().includes(term) ||
        student.className.toLowerCase().includes(term),
    )
  }

  if (filteredStudents.length === 0) {
    tableContainer.style.display = "none"
    emptyState.style.display = "block"
    return
  }

  tableContainer.style.display = "block"
  emptyState.style.display = "none"

  const today = getTodayString()

  const rowsHTML = filteredStudents
    .map((student) => {
      const todayAttendance = attendance[student.id]?.[today.monthKey]?.[today.dayKey] || ""

      return `
        <tr data-student-id="${student.id}">
          <td class="student-name-cell">${student.name}</td>
          <td>${student.fatherName}</td>
          <td>${student.phone}</td>
          <td>Class ${student.className}</td>
          <td class="fees-toggle-cell">
            <div class="fees-toggle ${student.feesPaid ? "paid" : ""}" 
                 onclick="toggleFees('${student.id}')" 
                 title="${student.feesPaid ? "Fees Paid" : "Fees Not Paid"}">
            </div>
          </td>
          <td class="attendance-toggle-cell">
            <div class="attendance-toggle-buttons">
              <button class="attendance-btn-small ${todayAttendance === "P" ? "present" : ""}" 
                      onclick="toggleTodayAttendance('${student.id}', 'P')" title="Present">
                P
              </button>
              <button class="attendance-btn-small ${todayAttendance === "A" ? "absent" : ""}" 
                      onclick="toggleTodayAttendance('${student.id}', 'A')" title="Absent">
                A
              </button>
            </div>
          </td>
          <td class="actions-cell">
            <div class="action-buttons">
              <button class="btn btn-secondary btn-table" onclick="editStudent('${student.id}')">
                Edit
              </button>
              <button class="btn btn-danger btn-table" onclick="deleteStudent('${student.id}')">
                Delete
              </button>
            </div>
          </td>
        </tr>
      `
    })
    .join("")

  tableBody.innerHTML = rowsHTML

  // Enhanced staggered animation
  const gsap = window.gsap
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const rows = tableBody.querySelectorAll("tr")
    gsap.fromTo(
      rows,
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.3,
        stagger: 0.05,
        ease: "power2.out",
      },
    )
  }
}

// Attendance Management
function initAttendanceTab() {
  initMonthSelector()
  initAttendanceFilters()
  initAttendanceActions()
  renderAttendanceTable()
}

function initMonthSelector() {
  const monthSelect = document.getElementById("month-select")
  const currentDate = getCurrentMonth()

  // Generate month options (current month and 11 months back)
  const months = []
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentDate.year, currentDate.month - 1 - i, 1)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const monthName = date.toLocaleDateString("en-US", { month: "long", year: "numeric" })

    months.push({
      value: formatMonth(year, month),
      label: monthName,
      year,
      month,
    })
  }

  monthSelect.innerHTML = months.map((m) => `<option value="${m.value}">${m.label}</option>`).join("")

  monthSelect.addEventListener("change", renderAttendanceTable)
}

function initAttendanceFilters() {
  const classFilter = document.getElementById("class-filter")
  const feesFilter = document.getElementById("fees-filter")

  // Populate class filter
  const classes = [...new Set(students.map((s) => s.className))].sort()
  classFilter.innerHTML =
    '<option value="">All Classes</option>' + classes.map((c) => `<option value="${c}">Class ${c}</option>`).join("")

  classFilter.addEventListener("change", renderAttendanceTable)
  feesFilter.addEventListener("change", renderAttendanceTable)
}

function initAttendanceActions() {
  const markAllBtn = document.getElementById("mark-all-present")
  const clearMonthBtn = document.getElementById("clear-month")

  markAllBtn.addEventListener("click", () => {
    showModal("Mark All Present", "Mark all students as present for the entire selected month?", markAllPresent)
  })

  clearMonthBtn.addEventListener("click", () => {
    showModal("Clear Month", "Clear all attendance records for the selected month?", clearMonth)
  })
}

function markAllPresent() {
  const monthSelect = document.getElementById("month-select")
  const selectedMonth = monthSelect.value
  const [year, month] = selectedMonth.split("-").map(Number)
  const daysInMonth = getDaysInMonth(year, month)

  const filteredStudents = getFilteredStudents()

  filteredStudents.forEach((student) => {
    if (!attendance[student.id]) {
      attendance[student.id] = {}
    }
    if (!attendance[student.id][selectedMonth]) {
      attendance[student.id][selectedMonth] = {}
    }

    for (let day = 1; day <= daysInMonth; day++) {
      attendance[student.id][selectedMonth][day.toString()] = "P"
    }
  })

  saveAttendance(attendance)
  renderAttendanceTable()
  showToast("All students marked present for the month")
}

function clearMonth() {
  const monthSelect = document.getElementById("month-select")
  const selectedMonth = monthSelect.value

  const filteredStudents = getFilteredStudents()

  filteredStudents.forEach((student) => {
    if (attendance[student.id] && attendance[student.id][selectedMonth]) {
      delete attendance[student.id][selectedMonth]
    }
  })

  saveAttendance(attendance)
  renderAttendanceTable()
  showToast("Month attendance cleared")
}

function getFilteredStudents() {
  const classFilter = document.getElementById("class-filter")
  const feesFilter = document.getElementById("fees-filter")

  let filtered = students

  if (classFilter.value) {
    filtered = filtered.filter((s) => s.className === classFilter.value)
  }

  if (feesFilter.value) {
    const feesPaid = feesFilter.value === "paid"
    filtered = filtered.filter((s) => s.feesPaid === feesPaid)
  }

  return filtered
}

function renderAttendanceTable() {
  const container = document.getElementById("attendance-table")
  const emptyState = document.getElementById("empty-attendance")
  const monthSelect = document.getElementById("month-select")

  const selectedMonth = monthSelect.value
  const [year, month] = selectedMonth.split("-").map(Number)
  const daysInMonth = getDaysInMonth(year, month)

  const filteredStudents = getFilteredStudents()

  if (filteredStudents.length === 0) {
    container.style.display = "none"
    emptyState.style.display = "block"
    return
  }

  container.style.display = "block"
  emptyState.style.display = "none"

  // Generate grid columns with better responsive sizing
  const gridColumns = `minmax(200px, 250px) repeat(${daysInMonth}, minmax(45px, 55px)) minmax(80px, 100px)`

  // Generate header with weekday labels
  const headerHTML = `
        <div class="attendance-header-cell">Student</div>
        ${Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const date = new Date(year, month - 1, day)
          const weekday = date.toLocaleDateString("en-US", { weekday: "short" })

          return `
            <div class="attendance-header-cell">
              <div class="date-header">
                <div class="date-number">${day}</div>
                <div class="date-weekday">${weekday}</div>
              </div>
            </div>
          `
        }).join("")}
        <div class="attendance-header-cell">Summary</div>
    `

  // Generate rows with enhanced data
  const rowsHTML = filteredStudents
    .map((student) => {
      const studentAttendance = attendance[student.id]?.[selectedMonth] || {}

      let presentCount = 0
      let absentCount = 0

      const daysCells = Array.from({ length: daysInMonth }, (_, i) => {
        const day = (i + 1).toString()
        const status = studentAttendance[day] || ""

        if (status === "P") presentCount++
        if (status === "A") absentCount++

        return `
                <div class="attendance-cell">
                    <button class="attendance-btn ${status === "P" ? "present" : status === "A" ? "absent" : ""}" 
                            onclick="toggleAttendance('${student.id}', '${selectedMonth}', '${day}')"
                            title="${status === "P" ? "Present" : status === "A" ? "Absent" : "Not marked"}">
                        ${status}
                    </button>
                </div>
            `
      }).join("")

      const attendancePercentage = daysInMonth > 0 ? Math.round((presentCount / daysInMonth) * 100) : 0

      return `
            <div class="student-info-cell">
                <div class="student-info-name">${student.name}</div>
                <div class="student-info-details">
                    Class ${student.className} • 
                    <span class="fees-status ${student.feesPaid ? "fees-paid" : "fees-unpaid"}">
                        ${student.feesPaid ? "Paid" : "Not Paid"}
                    </span>
                </div>
            </div>
            ${daysCells}
            <div class="attendance-cell summary-cell">
                <div style="color: #4facfe;">P: ${presentCount}</div>
                <div style="color: #fa709a;">A: ${absentCount}</div>
                <div style="color: var(--text-muted); font-size: 0.7rem;">${attendancePercentage}%</div>
            </div>
        `
    })
    .join("")

  container.innerHTML = `
        <div class="attendance-table">
            <div class="attendance-grid" style="grid-template-columns: ${gridColumns};">
                <div class="attendance-header-row">
                    ${headerHTML}
                </div>
                ${rowsHTML}
            </div>
        </div>
    `

  // Enhanced table animation with wave effect
  const gsap = window.gsap
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const cells = container.querySelectorAll(".attendance-cell, .student-info-cell")
    gsap.fromTo(
      cells,
      { y: 20, opacity: 0, scale: 0.9 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.3,
        stagger: {
          amount: 0.8,
          grid: "auto",
          from: "start",
        },
        ease: "power2.out",
      },
    )
  }
}

// Toggle attendance function
window.toggleAttendance = (studentId, month, day) => {
  if (!attendance[studentId]) {
    attendance[studentId] = {}
  }
  if (!attendance[studentId][month]) {
    attendance[studentId][month] = {}
  }

  const current = attendance[studentId][month][day] || ""
  let next = ""

  switch (current) {
    case "":
      next = "P"
      break
    case "P":
      next = "A"
      break
    case "A":
      next = ""
      break
  }

  if (next === "") {
    delete attendance[studentId][month][day]
  } else {
    attendance[studentId][month][day] = next
  }

  saveAttendance(attendance)
  renderAttendanceTable()
}

window.toggleTodayAttendance = (studentId, status) => {
  const today = getTodayString()

  if (!attendance[studentId]) {
    attendance[studentId] = {}
  }
  if (!attendance[studentId][today.monthKey]) {
    attendance[studentId][today.monthKey] = {}
  }

  const current = attendance[studentId][today.monthKey][today.dayKey] || ""

  if (current === status) {
    // If clicking the same status, clear it
    delete attendance[studentId][today.monthKey][today.dayKey]
  } else {
    // Set new status
    attendance[studentId][today.monthKey][today.dayKey] = status
  }

  saveAttendance(attendance)
  renderStudentsTable()

  // Show feedback
  const student = students.find((s) => s.id === studentId)
  if (student) {
    const statusText = current === status ? "cleared" : status === "P" ? "marked present" : "marked absent"
    showToast(`${student.name} ${statusText} for today`)
  }
}

// Fees Toggle Function
window.toggleFees = (studentId) => {
  const student = students.find((s) => s.id === studentId)
  if (!student) return

  student.feesPaid = !student.feesPaid
  saveStudents(students)
  renderStudentsTable()

  const statusText = student.feesPaid ? "marked as paid" : "marked as unpaid"
  showToast(`${student.name}'s fees ${statusText}`)
}

// Initialize Particles Background
function initParticles() {
  const particlesJS = window.particlesJS // Declare particlesJS variable
  if (particlesJS) {
    particlesJS("particles-js", {
      particles: {
        number: {
          value: 50,
          density: {
            enable: true,
            value_area: 800,
          },
        },
        color: {
          value: "#667eea",
        },
        shape: {
          type: "circle",
        },
        opacity: {
          value: 0.3,
          random: true,
          anim: {
            enable: true,
            speed: 1,
            opacity_min: 0.1,
          },
        },
        size: {
          value: 3,
          random: true,
          anim: {
            enable: true,
            speed: 2,
            size_min: 0.1,
          },
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: "#667eea",
          opacity: 0.2,
          width: 1,
        },
        move: {
          enable: true,
          speed: 1,
          direction: "none",
          random: false,
          straight: false,
          out_mode: "out",
          bounce: false,
        },
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: {
            enable: true,
            mode: "repulse",
          },
          onclick: {
            enable: true,
            mode: "push",
          },
          resize: true,
        },
        modes: {
          repulse: {
            distance: 100,
            duration: 0.4,
          },
          push: {
            particles_nb: 4,
          },
        },
      },
      retina_detect: true,
    })
  }
}

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  // Initialize particles background
  initParticles()

  // Initialize core functionality
  initTabs()
  initStudentForm()
  initStudentsList()

  // Enhanced entrance animation
  const gsap = window.gsap
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const tl = gsap.timeline()

    tl.fromTo(".app-header", { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" })
      .fromTo(
        ".tab-navigation",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
        "-=0.3",
      )
      .fromTo(
        ".tab-panel.active",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
        "-=0.2",
      )
  }

  console.log("🚀 Futuristic Student Attendance System initialized")
})

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Escape to cancel edit
  if (e.key === "Escape" && currentEditingStudent) {
    document.getElementById("close-edit-panel").click()
  }

  // Ctrl/Cmd + S to save form
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault()
    const activeTab = document.querySelector(".tab-panel.active")
    if (activeTab.id === "students-panel") {
      document.getElementById("add-student-form").dispatchEvent(new Event("submit"))
    }
  }
})
