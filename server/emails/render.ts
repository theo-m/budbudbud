import mjmll from "mjml";
import { compile } from "handlebars";
import { convert } from "html-to-text";
import * as fs from "fs";

const renderEmailTemplate =
  <T>(fn: string) =>
  (ctx: T) => {
    const templateStr = fs.readFileSync(fn);
    const template = compile(templateStr.toString());
    const mjml = template(ctx);
    const html = mjmll(mjml).html;

    return { html, text: convert(html) };
  };

export const renderEmailInvite = renderEmailTemplate<{
  name: string;
  inviter: string;
  group: string;
  groupDesc: string;
  url: string;
}>("templates/invite.mjml");
