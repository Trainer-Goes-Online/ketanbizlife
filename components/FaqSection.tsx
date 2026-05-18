"use client";

import { useState } from "react";
import type { ClientConfig } from "@/client.config";
import { ScrollReveal } from "./ScrollReveal";
import styles from "./FaqSection.module.css";

interface Props {
  faq: ClientConfig["faq"];
}

export function FaqSection({ faq }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className={`light ${styles.section}`} aria-labelledby="faq-heading">
      <div className="container-narrow">
        <ScrollReveal>
          <h2 id="faq-heading" className={styles.heading}>
            {faq.heading}
          </h2>
        </ScrollReveal>

        <ul className={styles.list} role="list">
          {faq.items.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <ScrollReveal key={i} delay={0.04 + i * 0.04}>
                <li className={`${styles.item} ${isOpen ? styles.open : ""}`}>
                  <button
                    type="button"
                    className={styles.trigger}
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    id={`faq-trigger-${i}`}
                  >
                    <span className={styles.question}>{item.question}</span>
                    <span className={styles.icon} aria-hidden="true">
                      <span className={styles.iconBar} />
                      <span className={`${styles.iconBar} ${styles.iconBarV}`} />
                    </span>
                  </button>
                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-trigger-${i}`}
                    aria-hidden={!isOpen}
                    className={styles.panel}
                  >
                    <div className={styles.panelInner}>
                      <p className={styles.answer}>{item.answer}</p>
                    </div>
                  </div>
                </li>
              </ScrollReveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
