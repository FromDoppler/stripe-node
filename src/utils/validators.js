class Validators {
  static isValidEmail(email) {
    if (!email) return true; // Email opcional
    return (
      email.includes("@") &&
      email.length > 3 &&
      !email.startsWith("@") &&
      !email.endsWith("@")
    );
  }

  static isValidSessionId(sessionId) {
    return sessionId && sessionId.startsWith("cs_") && sessionId.length > 3;
  }
}

module.exports = Validators;
