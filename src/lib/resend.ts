import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY || "re_mock_key_for_build_purposes";

const resend = new Resend(resendApiKey);

export default resend;
export const hasResendConfigured = !!process.env.RESEND_API_KEY;
