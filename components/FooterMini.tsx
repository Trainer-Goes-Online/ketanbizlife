import Link from "next/link";
import type { ClientConfig } from "@/client.config";
import styles from "./FooterMini.module.css";

interface Props {
  brand: ClientConfig["brand"];
  footer: ClientConfig["footer"];
}

export function FooterMini({ brand, footer }: Props) {
  return (
    <footer className={styles.footer}>
      <div className={`container-narrow ${styles.inner}`}>
        <p className={styles.copyright}>
          <span className={styles.brandMark}>{brand.name.toUpperCase()}</span>
          <span className={styles.dot} aria-hidden="true">
            ·
          </span>
          {footer.copyright}
        </p>

        <nav className={styles.links} aria-label="Legal links">
          {footer.legalLinks.map((link, i) => (
            <span key={link.href} className={styles.linkWrap}>
              {i > 0 ? (
                <span className={styles.sep} aria-hidden="true">
                  ·
                </span>
              ) : null}
              <Link href={link.href} className={styles.link}>
                {link.label}
              </Link>
            </span>
          ))}
        </nav>
      </div>
    </footer>
  );
}
