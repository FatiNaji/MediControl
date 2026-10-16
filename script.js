const form = document.getElementById("loginForm");
const password = document.getElementById("password");
const showPassword = document.getElementById("showPassword");
const register = document.getElementById("register");
const forgot = document.getElementById("forgot");
const message = document.getElementById("message");
const patientFoundCard = document.getElementById("patientFoundCard");
const patientFoundName = document.getElementById("patientFoundName");
const patientFoundDni = document.getElementById("patientFoundDni");

const loginRoleModal = document.getElementById("loginRoleModal");
const closeLoginRole = document.getElementById("closeLoginRole");
const loginFormOverlay = document.getElementById("loginFormOverlay");
const openLogin = document.getElementById("openLogin");
const closeLogin = document.getElementById("closeLogin");
const forgotForm = document.getElementById("forgotForm");

showPassword?.addEventListener("click", () => {
  password.type = password.type === "password" ? "text" : "password";
});

function openLoginRoleModal() {
  loginRoleModal?.classList.add("show");
}

function closeLoginRoleModal() {
  loginRoleModal?.classList.remove("show");
}

closeLoginRole?.addEventListener("click", closeLoginRoleModal);

loginRoleModal?.addEventListener("click", (event) => {
  if (event.target === loginRoleModal) closeLoginRoleModal();
});

// Primero se elige el tipo de usuario y recién después aparece el formulario.
document.querySelectorAll("#loginRoleModal .role-option").forEach(button => {
  button.addEventListener("click", () => {
    const role = button.dataset.role;
    localStorage.setItem("medicontrolRol", role);

    closeLoginRoleModal();
    loginFormOverlay?.classList.add("show");

    const formTitle = document.querySelector(".form-brand h2");
    const formDescription = document.querySelector(".form-brand p");
    const nombreInput = document.getElementById("nombre");
    const dniInput = document.getElementById("password");

    if (role === "paciente") {
      formTitle.textContent = "Iniciar como paciente";
      formDescription.textContent = "Ingresa tu nombre y tu DNI para continuar.";
      nombreInput.placeholder = "Nombre o Apellido del paciente";
      dniInput.placeholder = "DNI del paciente";
      dniInput.setAttribute("aria-label", "DNI del paciente");
    } else {
      formTitle.textContent = "Iniciar como apoderado";
      formDescription.textContent = "Ingresa tu nombre y el DNI del paciente que supervisas.";
      nombreInput.placeholder = "Nombre del apoderado";
      dniInput.placeholder = "DNI del paciente/familiar";
      dniInput.setAttribute("aria-label", "DNI del paciente o familiar");
    }

    message.textContent = "";
    nombreInput.value = "";
    dniInput.value = "";
    hidePatientFound();
    setTimeout(() => nombreInput?.focus(), 100);
  });
});

openLogin?.addEventListener("click", openLoginRoleModal);

closeLogin?.addEventListener("click", () => {
  loginFormOverlay?.classList.remove("show");
});

loginFormOverlay?.addEventListener("click", (event) => {
  if (event.target === loginFormOverlay) loginFormOverlay.classList.remove("show");
});

function showMessage(text, color = "#c94c4c") {
  if (!message) return;
  message.style.color = color;
  message.textContent = text;
}

function hidePatientFound() {
  patientFoundCard?.classList.remove("show");
  if (patientFoundName) patientFoundName.textContent = "—";
  if (patientFoundDni) patientFoundDni.textContent = "DNI: —";
}

// En el prototipo, el apoderado no depende de una base de datos previa.
// Cualquier DNI de 8 dígitos puede usarse para la simulación.
function checkRegisteredPatient() {
  const role = localStorage.getItem("medicontrolRol") || "paciente";
  if (role !== "apoderado") {
    hidePatientFound();
    return;
  }

  const dniIngresado = password?.value.trim() || "";
  const nombrePacienteDemo = localStorage.getItem("medicontrolUsuario") || "Diego Gomez";

  if (/^\d{8}$/.test(dniIngresado)) {
    if (patientFoundName) patientFoundName.textContent = nombrePacienteDemo;
    if (patientFoundDni) patientFoundDni.textContent = `DNI: ${dniIngresado}`;
    patientFoundCard?.classList.add("show");
  } else {
    hidePatientFound();
  }
}

password?.addEventListener("input", checkRegisteredPatient);

form?.addEventListener("submit", (event) => {
  event.preventDefault();

  const nombreIngresado = document.getElementById("nombre").value.trim();
  const dniIngresado = password.value.trim();
  const selectedRole = localStorage.getItem("medicontrolRol") || "paciente";

  if (!nombreIngresado || !dniIngresado) {
    showMessage("Completa todos los datos.");
    return;
  }

  if (selectedRole === "paciente") {
    // Igual que el acceso del apoderado, el prototipo permite entrar
    // sin depender de una cuenta previamente registrada.
    // Basta con colocar cualquier nombre y un DNI válido de 8 dígitos.
    if (!/^\d{8}$/.test(dniIngresado)) {
      showMessage("El DNI debe tener exactamente 8 números.");
      return;
    }

    localStorage.setItem("medicontrolUsuarioActivo", nombreIngresado);
    localStorage.setItem("dniPacienteActivo", dniIngresado);
    localStorage.setItem("medicontrolUsuario", nombreIngresado);
    localStorage.setItem("medicontrolDni", dniIngresado);

    showMessage("✓ Datos correctos. Ingresando como paciente...", "#08758e");
    setTimeout(() => window.location.href = "principal.html", 500);
    return;
  }

  // APODERADO: para el prototipo se permite cualquier nombre y cualquier DNI válido de 8 dígitos.
  // No se exige que exista previamente un paciente ni que el nombre coincida con una cuenta.
  if (!/^\d{8}$/.test(dniIngresado)) {
    showMessage("El DNI del paciente debe tener exactamente 8 números.");
    return;
  }

  localStorage.setItem("apoderadoNombreActivo", nombreIngresado);
  localStorage.setItem("dniPacienteActivo", dniIngresado);
  localStorage.setItem("apoderadoPacienteVinculado", "true");

  // Guardamos estos datos para que las pantallas del apoderado puedan mostrar
  // la información introducida durante la demostración.
  localStorage.setItem("medicontrolDniPaciente", dniIngresado);
  localStorage.setItem("apoderadoNombre", nombreIngresado);
  localStorage.setItem("medicontrolApoderadoNombre", nombreIngresado);

  showMessage("✓ Datos correctos. Ingresando al panel...", "#08758e");
  setTimeout(() => window.location.href = "apoderado.html", 500);
});

forgotForm?.addEventListener("click", () => {
  const role = localStorage.getItem("medicontrolRol") || "paciente";
  showMessage(
    role === "apoderado"
      ? "Ingresa el nombre del apoderado y un DNI de 8 números del familiar."
      : "Para el paciente, utiliza el nombre registrado y su DNI.",
    "#08758e"
  );
});

// Registro
const registerChoiceModal = document.getElementById("registerChoiceModal");
const closeRegisterChoice = document.getElementById("closeRegisterChoice");

function openRegisterChoice() {
  registerChoiceModal?.classList.add("show");
}
function closeRegisterChoiceModal() {
  registerChoiceModal?.classList.remove("show");
}

register?.addEventListener("click", openRegisterChoice);
closeRegisterChoice?.addEventListener("click", closeRegisterChoiceModal);
registerChoiceModal?.addEventListener("click", (event) => {
  if (event.target === registerChoiceModal) closeRegisterChoiceModal();
});

document.querySelectorAll("#registerChoiceModal .role-option").forEach(button => {
  button.addEventListener("click", () => {
    localStorage.setItem("medicontrolRol", button.dataset.role);
    window.location.href = "registro.html";
  });
});

forgot?.addEventListener("click", () => {
  showMessage("Selecciona primero si ingresarás como paciente o apoderado.", "#08758e");
});
