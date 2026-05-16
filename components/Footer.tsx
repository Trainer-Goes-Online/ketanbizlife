import Image from "next/image";
import Link from "next/link";
import type { ClientConfig } from "@/client.config";
import styles from "./Footer.module.css";

interface Props {
  brand: ClientConfig["brand"];
  footer: ClientConfig["footer"];
  social: ClientConfig["social"];
}

export function Footer({ brand, footer, social }: Props) {
  const socialLinks = [
    { key: "instagram", label: "Instagram", url: social.instagram, icon: "𝕀𝕘" },
    { key: "youtube", label: "YouTube", url: social.youtube, icon: "▶" },
    { key: "linkedin", label: "LinkedIn", url: social.linkedin, icon: "in" },
    { key: "twitter", label: "Twitter / X", url: social.twitter, icon: "𝕏" },
    {
      key: "whatsappChannel",
      label: "WhatsApp Channel",
      url: social.whatsappChannel,
      icon: "✓",
    },
  ].filter((s) => s.url.trim().length > 0);

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <div className={styles.brand}>
            <Image
              src="/logo.svg"
              alt={brand.name}
              width={160}
              height={32}
              priority={false}
            />
            <p className={styles.tagline}>{brand.tagline}</p>
          </div>

          <nav className={styles.links} aria-label="Legal links">
            {footer.legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className={styles.link}>
                {link.label}
              </Link>
            ))}
          </nav>

          {socialLinks.length > 0 ? (
            <ul className={styles.social} aria-label="Social media">
              {socialLinks.map((s) => (
                <li key={s.key}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className={styles.socialIcon}
                  >
                    {s.icon}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>{footer.copyright}</p>
          <p className={styles.disclaimer}>{footer.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
