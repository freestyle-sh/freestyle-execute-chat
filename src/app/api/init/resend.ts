import { db } from "@/db";
import {
  freestyleModulesEnvironmentVariableRequirementsTable,
  freestyleModulesTable,
} from "@/db/schema";
import { siResend } from "simple-icons";

export default async function initResend() {
  const resendMod = await db
    .insert(freestyleModulesTable)
    .values({
      name: "resend",
      svg: siResend.svg,
      lightModeColor: siResend.hex,
      darkModeColor: "000000",
      nodeModules: {
        resend: "4.1.2",
      },
      setupInstructions: `
1. **Sign up for Resend**:
   [Create a free Resend account](https://resend.com/signup)

2. **Create an API key**:
   - Go to the [API Keys section](https://resend.com/api-keys) in your dashboard
   - Click "Create API Key" and give it a name
   - Copy your API key (you'll only see it once!)

3. **Set up domain (optional but recommended)**:
   - Go to [Domains](https://resend.com/domains) and add your domain
   - Follow the DNS verification instructions
   - This allows you to send emails from your domain`,
      documentation: `
    ## Setup

First, you need to get an API key, which is available in the [Resend Dashboard](https://resend.com).

\`\`\`js
import { Resend } from 'resend';
const resend = new Resend('re_123456789');
\`\`\`

## Usage

Send your first email:

\`\`\`js
await resend.emails.send({
  from: 'you@' + process.env.RESEND_DOMAIN,
  to: 'user@gmail.com',
  replyTo: 'you@example.com',
  subject: 'hello world',
  text: 'it works!',
});
\`\`\`

## Send email using HTML

Send an email custom HTML content:

\`\`\`js
await resend.emails.send({
  from: 'you@' + process.env.RESEND_DOMAIN,
  to: 'user@gmail.com',
  replyTo: 'you@example.com',
  subject: 'hello world',
  html: '<strong>it works!</strong>',
});
\`\`\`

Only send emails from email addresses under the RESEND_DOMAIN.
`,
      example:
        "Send emails to your friends, customers or anyone else using Resend API.",
    })
    .returning();

  db.insert(freestyleModulesEnvironmentVariableRequirementsTable).values([
    {
      moduleId: resendMod[0].id,
      name: "RESEND_DOMAIN",
      description: "Your domain in Resend",
      example: "example.com",
    },
    {
      moduleId: resendMod[0].id,
      name: "RESEND_API_KEY",
      description: "Your API key from Resend",
      example: "re_123456789",
    },
  ]);
}
