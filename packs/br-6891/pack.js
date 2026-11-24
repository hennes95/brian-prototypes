/* BR-6891 · Hidden course material: ticket pack for feature workbench shell 1.0.0 (see workbench/feature/PACK-API.md).
   Screens: Teacher CMS (desktop, 1720×1080, Figma 10500:26471) and Student app (phone, 390×844). */
const PACK={
  id:"BR-6891", title:"Hidden course material",
  protoUrl:"https://claude.ai/artifact/5SGQrfZGKW3Fjw9tUKFWEo",
  dbDoc:"workbench/br-6891-v2", legacyDbDoc:"workbench/br-6891", lsKey:"wb-br6891-v2",
  ui:{sel:{kind:"state",mode:"cm",state:"cm-rest"},variant:"v2",context:"cms"},
  protoStartKind:"cm-rest",
  links:[{"label": "Ticket", "name": "BR-6891 · Hidden course material", "url": "https://app.notion.com/p/3f7fca9f403c80d5a296cd7f343bf5c0"}, {"label": "Design", "name": "Figma · BR-6891", "url": "https://www.figma.com/design/c3ccOGwhciWpL7bF0fpF5G/Teacher-CMS?node-id=10500-25901"}, {"label": "Feature Workbench", "name": "Feature Workbench", "url": "https://claude.ai/artifact/5SGQrfZGKW3Fjw9tUKFWEo"}, {"label": "Handoff", "name": "Handoff", "url": ""}]   /* link hub (Implementation), from pack.json → links */
};

const FIG = id => "https://www.figma.com/design/c3ccOGwhciWpL7bF0fpF5G/Teacher-CMS?node-id=" + id;

const FILES = [
  { id:"b", name:"Access 3 – Unit 6 Student Book.pdf", usedIn:"Introduction to English Grammar" },
  { id:"e", name:"Access 3 – Unit 6 Exercises.pdf", usedIn:"The City of London, Irregular verbs" },
  { id:"s", name:"Access 3 – Unit 6 Solutions.pdf", usedIn:"The City of London, Irregular verbs" },
  { id:"t", name:"Teacher notes – The City of London.docx", usedIn:"The City of London" },
  { id:"i", name:"Irregular verbs list.pdf", usedIn:"Irregular verbs" },
  { id:"v", name:"Unit 6 Vocabulary.pdf", usedIn:"The City of London, Irregular verbs" },
  { id:"k", name:"Test Unit 6 – Answer key.pdf", usedIn:"Unit 6 Check-In" }
];
const NEW_FILE = { id:"n", name:"Access 3 – Unit 7 Solutions.pdf", usedIn:"–" };

/* esc() comes from the shell */
const SV = (d, w=16, sw=1.8) => `<svg aria-hidden="true" width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const IC = {
  eye: w => SV('<path d="M2.5 12C3.5 9.5 7 5 12 5s8.5 4.5 9.5 7c-1 2.5-4.5 7-9.5 7s-8.5-4.5-9.5-7z"/><circle cx="12" cy="12" r="3"/>', w),
  eyeOff: w => SV('<path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c5 0 8.5 4.5 9.5 7a13 13 0 0 1-3 4.2M6.6 6.6C4.5 8 3.1 10.1 2.5 12c1 2.5 4.5 7 9.5 7 1.8 0 3.4-.6 4.8-1.5"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>', w),
  lock: (w, sw=2.4) => SV('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>', w, sw),
  file: w => SV('<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>', w, 2),
  dl: w => SV('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>', w),
  plus: w => SV('<path d="M12 5v14M5 12h14"/>', w, 2.4),
  close: w => SV('<path d="M6 6l12 12M18 6L6 18"/>', w, 2.2),
  link: w => SV('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>', w, 2),
  back: w => SV('<path d="M15 5l-7 7 7 7"/>', w, 2),
  check: w => SV('<path d="M5 12.5l4.5 4.5L19 7.5"/>', w, 2.2),
  courses: w => SV('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>', w, 1.6),
  library: w => SV('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>', w, 1.6),
  people: w => SV('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14.5c2.3 0 4 1.5 4.6 4"/>', w, 1.6),
  help: w => SV('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.7M12 17h.01"/>', w, 1.6)
};


/* ---------- screens ---------- */
/* logo + avatar cropped from the Figma frame render (1x) */
const IMG_LOGO="data:image/png;base64,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";
const IMG_AVATAR="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAYAAACohjseAAAPg0lEQVR4Xq2aeWxUZRfGD9NCp7RAWwq0gEjZlEWhFRdaWYts4oYiqJ9/WKrxDyFfIhrUxARMUEKMokb+YAkKhh1XwBhAFosbFBQEhbIvLVtZWuhAWb78Tr8z3rmd5Rb6JJNOZ+7yPu95znPO+95pMG79jRtSj7geqJTA8b0SKN0rl0tr/vLZlbOlIXdplJopDVMyJM7fRBI7ZIs/s7M07pBdjyOpQYP6IAiBS/uKpXzzUgmU7ZFrVZUhA83IyJAmTZpIcnJy8PPS0lIpKysLOS4uMVmS2udIUve+kpIzol7I3hJBiJUXLZbyzUuCpCDTr18/6dy5s2RnZ0tmZmbUge7du1fJbtu2TV/8DxqmZijZFoMLJD41+jWi4aYIuokRmTFjxsjw4cNjEooFyM6dO1fJ8h60yC/QiN4M0ToTrNi1SU6unKE5RbSMGBKsb6xatUrJQpSIpuePq7N0PRMkaqfWzpHyoiXBiI0ePTomsaNHj0pxcbGcPn1aDhw4oBFmMpo2bSp33323tGjRQhISEqRhw4YR5weSc+bM0e/Tcp9W2fr83ibUE8Hqc2VydP4kdURy6913340pxYqKCvnmm2/k3LlzcvXqVSXatm1bady4sVy+fFmjf/bsWblx44Y0aNBAOnbsKIMGDYpIkiiOHz8+GM32hZ94kqwvlqwgd3jWK0oOOc6bNy8muYsXL8q6devk8OHDkpKSogSZmEAgoM5ZUlIiJ06ckPT0dImLi5O//vpLfv/9d1myZIlcuHAh7JCI/LJly2TcuHFSfbZMDs5+Ra66Sk84RCVo5Mi3wsJCmTBhQqz5UKxdu1bOnz+vg0J+kOjatav+3717d3nooYfkn3/+kUOHDklSUpJK/tixYzoxX3/9tU5MJBQUFNSJZHykC7nJvfDCC57IEaHNmzdL+/bt5dq1a0q0Q4cOcuTIEZWjz+eTTp06yfXr11Wqfr9fcnNzVXpVVVVKOj4+Xtq1axeVJCAviWQ0uYaNIIaCLC1yXslduXJF1q9frwYCgebNm0taWpqcOnVKZXnmzBn9u2nTJn1PHiYmJioxcrBZs2Zy3333KcmioiKVtJdIHl4wSa4HKrxLFLesCznyZsWKFep2GzdulEaNGsntt98u+/fvV4IAx8zJyZERI0Zo/vXq1Us/hwzn8xcgT8yH63z33XdSXV0dlSS+cLm0RE6tqXFZN2pF8PzWVVoKmF2vkfv555/VNTEKnLJv374qVfLu+PHjGgkGTl2jXHTr1k1zEAOCHNEkDykVEKKbQdo48L59+6KmBr7QpUsXbRMrdm2MTpC8O71urh40Y8aMqBc24JB79uzRfLp06ZLm2a+//qoDJIIM2mpc69atlSiSxFSoi5gO1/jzzz/VTSHdpk0bPRaJ81ksjBo1Sg85sXJGLamGmAzRs66fqDz55JNqCtHA7Lds2VIee+wxPRZ54ox///23RgUSt912mzopeUkLhqkg3crKSiXL/8h22LBh2gRAqlWrVkr2zTffVNNhIjAr93i4vzUBlI8zRUukRf644JCDBIkeuWf46KOPdIDclELsBoMlUj/99JN2I7jhc889p1KlvhFVogBBBsvnyO/kyZPSo0cPlTDXwFiYFFwXMyKayJzrQQz5MQE//vij7N69W/tdPgec/+mnn+p5BtKred7TwU4nSNCdpHYy8srPzw8hyawvXbpUCTz77LPqnABHhBC5yEBxTGacPOQ6DLJ3794ybdo0GThwoJKjw7HBck+uTe5iSoDzOe6JJ57Q+oqyHnzwQR0P73FkJ6gAzigGCVYd2FYrSuXl5RpJijXGAcixb7/9VgeAExIZ5Aeoe/Sdjz76qErNHXnyDNOALNcL16AzKZiMEdy5c6eWDI5nomn/uAYq+eCDD7Q5cMMZRSXozD030DiGQw95zz33yB9//KEDg5zZOYYBKOZEYOvWrfrXAHEii2PSiSBfSgq5iRQB8kW2OC7Wb6DFQ8IoZuzYsTJgwAB9jxvbcqpW+gQq5eL+7dKkW9+aMlGxOzTMbnCht956S8lRn7gJkVu4cKF2JRYJcg0SSI3FLnXv/vvv1yaaQfM95YcSwflI2gBR/rf+1QC5vLw8NTLUgbMSPUuLSCgvWqRfaQQvhZGnGwxo0qRJ8tprr+lAyAdyAXfDbAxE9eDBg1o2DBBmxinma9as0WimpqbqIJ2uaO8xrsGDB+vpSBRiffr00agzcffee698/vnnISpxI1BaoiUj/tL+YrlWFb7NcQP3IjcYMDNNThBRcobcRKK0aeQYxkI0IYYrMim0Yxs2bNCSYjnN/5z/1FNPaVkgJbgm4HwmEDPBebOysvRYroO8OTYSaja/SiSeNscruBmORpIzaAZAzbrrrru0ppFr7Mc88MADwQEyOGweGTMxb7/9tv419O/fX18GjAlntbJidfSLL77QkoEK7rjjDlVALFSV7RHfRQ/yNKB/ogMpW58xcCKHOUDGKVeiOXTo0GCOIjWMaseOHToZ4QAhTItGAaNi8mgZyWWkaw24F4KXj+0VH6H0CjoUQPkgN4gWzTN1i7pHpIjsDz/8UOuSSJWcgzD5yXtk7QSyRrLkOrlG64d7k2+cQ+1EKSBc8+EG+7Lx1edCN2SjwbmvyQ24+axZs7SToI0iT3BVDIj2CYsHkENydCHIk7aM/9kd4DzqKCUCEkSLXASQ+eyzz3RiX3zxRb2PrTpYmsXCtUClxF8p906QyAHczhar9JaYz+LFi7VIjxw5UqPEsRBhIu688061dnNJ6hlmQa+LHIkk+UV/yrWQIZEkFZgQaySolda4hyvwbtB+RlzRh4OtzVjrbdmyRW9MTaROES0K8IIFC7QJ4GVrQcPKlSulZ8+eGmkIkqO83GA/h/6WqFEHkSZEv//+e723RdcL6kQQyTDbFGwGxv4JZoNhWLNN1OhkKCOPPPKISnH+/Pmya9cu7SdZxCI5W/C6gZy5D7kNbDIwMq5NeWGinXU2GmLuqjmBdLg4DkYdwtlodtmDMelCmMExAEj+9ttvakhEhNUAzTZFnNxzgghhPDQC1DkDCsFNmUCUAsg/Z6mJhvhGaZlSlzwEFFiiQD1idY6bOmEbS6weGBykKDG4JAQwC0g888wzQbtnkjiW/HQDc6PIE11ym3MtL6OBp1c+n//fJz6xwMC5MFJBppQGHM854wY6HqTLgIj2448/rit1zIF+lHOZAAOrf8zJDUoFkeca9KNMLuOAcKzFONv9Pn9ml1i8gsBIIIj0uAEyoatBhu6axqCwfqTI9gU9Ks03pJE6ssV5OeaXX37RY9wDJtqLFi1SefIdqWGFnn4UA4oGnj36/BmdPBHkJjggwPpZIxINokeHAUnLD1o48olVOisJjsGQMB8ckYFTAshLSCLN559/vtY4IMU9SQdyGqkyqUwW+U+DEa3gJ3bMkfiETG8E6Re5IBFDLix5Vq9erTNKVLZv3x58uAKYAGYcKUOEXKX9giR7nwyUSUMVkA4HHJT2DzLIme0TxkAzTsPOjhpdDykTDomZnSU+oXUXiUtsEnVFQSReeuklHTSuST85e/ZsNQt2oBksBoK7sWqnIYe45RSRgAylgXLx+uuvK2kiF6kn5XMmhHMhyjYIUYQg61JSgPevvvqqfPjhh3r/EKPzJ0vjrGzxxfmTJSGzpqUKB5xyypQpagwUdxKdQkyy43i0ZcwunyE3BkXXgox4mOKuV+zhQA6whHK2fwYm7Msvv9StEQZOfjOpdDcQJnpsY5AilI73339fuyUnkrJqnvdrHWyeOzosOS7KyeQQbRgLWbp7Zg+iDICFKPIl4RkIcvrqq6/0fxyU2fXSVoXMvs+nxZ4aSMS5DlJmUnFbcpKxsaNGyjD59MBOJPeoWYIpwcQOOSpTN+gLeRE5WjDWeXQmWDcyRPuQYsZZ/CJXvsNkGCTfs/ypK0GaCcoI0eE+LLOINvWWsXAPVhv0ve+99562dPiBgfKQkj38X4LIlCenbrBu46Ej5HguRx/IYpSbQQqpkQf2P4/FyMshQ4ZoDmFGfOel8zdADGMhItRYWjOWX0wSdRSzYvFLjnNvjAdlOXM5KSsneL1gq5aa93StKDJTnMwyx7YIsHgGzCxbLaTWMQBkjGsiYRyUKNomLeBZg61IDJBhRQKoiQweVbC25C/GhMnw8BPwnqjinkSW+7lrcPP8guD1g822RdG5uw2oMxCCGC971sBKgU0nHI1tQNaGTIjtXEOQ4o1Ely9frt9zLV7URiaMAm/1kDJD3jKZKIOmnHzmPZ+T85gM+c4yC6m+8cYbOkZn9NLzC/VHRoaQ1QRRPL9tVUhvCrnp06drNCZPnqyJToSQEt9BxDoNtheRFdKm4YY8pQLX01xPTNRJoI7RCLAGRPrOKBuIEhMEMc5hMnFWokYbSL7jpE6Qe81yhoV8FkKQKLYaMUGOLKiZGQMzhAzQPQ5GGcDlWNNBlM9tfxTSdB90NjTYzLhz/5NIkjex4JQd92PyWG5NnTpVn0WarJ1IHxwaPVBruZTcrZ+k5f27s2zAVIgkL2THIG3ZQmdi7RuSQsoMivYr1i+dIgFCtgeEmdDq0RjQC1N3yWcn0nLHBJ3TibAL3vT8At0MDhzfE3KwbccTIcyB/RMKOQtayofVL+RpzyduBhgRUrSflWBiPDzls3A/UNAfCQ0O/xuCsAtepNr2P1OFtWI4UDbYHqQGcUOiSU5Q95AjeVqX0mCgflLPMBNnf0mOUsxxafd1Ideu8BNdOYRDxC2LhimZ0q7wYzk8e3ytBTHywDwg9c4776h8uTFRhBzWzjHkYF1AflJuMCDMyrmnQ/2DoBNGzumabkTdsjCS4SKJA7KInTlzpj59IvcYHA9BMSDWe84nTF7ARFE+Hn74YW0WnO5KvasrubAm40YkkrY2ZPPJ6pT9nThxonY90Z4dhAPnU/tYvbifHVqDDvytO6sso0XO4GnTCZLtX5kX4q4kvQF5soNGc0w3wswjU3a5bwbUQOQOUAObyDyIBbglqeOFHPD0Yzwnzhev0l9isFFF4lOobYuPdR7EWBLdCjAbll4QZcllP6dsOfK/0rRrzZNmr6gzQcB2/7mtq+X0/3+0AFF6RDoUHnS+/PLLXu9fC5ChTYMYHQw/c07NHSNpeaMjOmU03BRBA0RPrZkrVQe3BZ2WAk/9sp8z2/OJSLCfM9MVsVtgj6VvlZjhlgi6pXth10b9MYP7R+l0M0TZQF7xcj9jhxS7C3RSjbN63VTE3Kg3gk7w1DhQViIX9xfrk9bqs6X6Ix0nqGEsshMyOom/dRcl5s/sVC+knPgfhWXOY5SmUvsAAAAASUVORK5CYII=";

/* ---------- Teacher CMS: Figma 10500:26471 layout, styled with the Brian Teacher Design System (design-systems/brian-teacher, .ds-teacher) ---------- */
const FI = (d, w=24, vb=24, fill="none", stroke="currentColor", sw=2) => `<svg aria-hidden="true" width="${w}" height="${w}" viewBox="0 0 ${vb} ${vb}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const TI = {
  collapse: FI('<path d="M10 7l-5 5 5 5M5 12h7M14 7h6M15 12h5M14 17h6"/>'),
  /* from the design system (SidebarNavItem): dashboard, directory, help */
  dashboard: `<svg aria-hidden="true" viewBox="0 0 23 23" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8.17 1.5H2.83c-.73 0-1.33.6-1.33 1.33v5.34c0 .73.6 1.33 1.33 1.33h5.34c.73 0 1.33-.6 1.33-1.33V2.83c0-.73-.6-1.33-1.33-1.33zM20.17 1.5h-5.34c-.73 0-1.33.6-1.33 1.33v5.34c0 .73.6 1.33 1.33 1.33h5.34c.73 0 1.33-.6 1.33-1.33V2.83c0-.73-.6-1.33-1.33-1.33zM8.17 13.5H2.83c-.73 0-1.33.6-1.33 1.33v5.34c0 .73.6 1.33 1.33 1.33h5.34c.73 0 1.33-.6 1.33-1.33v-5.34c0-.73-.6-1.33-1.33-1.33zM20.17 13.5h-5.34c-.73 0-1.33.6-1.33 1.33v5.34c0 .73.6 1.33 1.33 1.33h5.34c.73 0 1.33-.6 1.33-1.33v-5.34c0-.73-.6-1.33-1.33-1.33z"/></svg>`,
  library: FI('<path d="M6 3h11a2 2 0 0 1 2 2v13H7a2 2 0 0 0 0 4h12"/><path d="M5 20V5a2 2 0 0 1 1-2M9 8h6M9 12h6"/>', 24, 24, "none", "currentColor", 1.7),
  directory: `<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M10.75 3.36A4.03 4.03 0 0 0 7.73 2c-1.16 0-2.26.5-3.03 1.36a4.06 4.06 0 0 0-.98 3.17l.13 1.05A3.88 3.88 0 0 0 7.73 11c1.96 0 3.62-1.47 3.87-3.42l.13-1.05a4.06 4.06 0 0 0-.98-3.17zM20.25 2.22A3.6 3.6 0 0 0 17.57 1c-1.02 0-2 .44-2.67 1.22a3.6 3.6 0 0 0-.83 2.82l.15 1.06A3.39 3.39 0 0 0 17.57 9c1.68 0 3.12-1.25 3.35-2.9l.15-1.06a3.6 3.6 0 0 0-.82-2.82zM23.99 17.1l-.36-3.58a2 2 0 0 0-1.31-1.69 14.4 14.4 0 0 0-9.11-.12 4.6 4.6 0 0 1 3.68 4.03l.49 2.94c.07.44.07.88.03 1.31h.17c1.68 0 3.37-.26 5.04-.79a1.86 1.86 0 0 0 1.37-2.1zM15.4 19l-.49-2.93a2.9 2.9 0 0 0-2.22-2.42 19.5 19.5 0 0 0-9.94 0A2.9 2.9 0 0 0 .53 16.07L.04 19a2.85 2.85 0 0 0 2.34 3.43c1.77.38 3.56.56 5.35.56 1.78 0 3.57-.18 5.34-.56A2.85 2.85 0 0 0 15.4 19z"/></svg>`,
  help: `<svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor"><path d="M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10S15.5 0 10 0zm0 16.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm2.03-6.13c-.62.53-.78.71-.78 1.13a1.25 1.25 0 0 1-2.5 0c0-1.62.99-2.47 1.65-3.03.62-.53.78-.71.78-1.13 0-.23 0-.84-1.18-.84-.55.03-1.13.28-1.57.7a1.25 1.25 0 0 1-1.72-1.82 5.06 5.06 0 0 1 3.23-1.38h.01c2.26 0 3.74 1.34 3.74 3.33 0 1.62-.99 2.47-1.65 3.03z"/></svg>`,
  language: FI('<circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c2.6 2.7 3.9 5.8 3.9 9.5s-1.3 6.8-3.9 9.5c-2.6-2.7-3.9-5.8-3.9-9.5s1.3-6.8 3.9-9.5z"/>', 24, 24, "none", "currentColor", 1.7),
  chevron: FI('<path d="M4 6l4 4 4-4"/>', 16, 16),
  sparkle: `<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14 4c.5 3.6 2.4 5.5 6 6-3.6.5-5.5 2.4-6 6-.5-3.6-2.4-5.5-6-6 3.6-.5 5.5-2.4 6-6z"/><path d="M6 1.5c.3 1.8 1.2 2.7 3 3-1.8.3-2.7 1.2-3 3-.3-1.8-1.2-2.7-3-3 1.8-.3 2.7-1.2 3-3zM6.5 15c.3 1.9 1.3 2.9 3.2 3.2-1.9.3-2.9 1.3-3.2 3.3-.3-2-1.3-3-3.2-3.3 1.9-.3 2.9-1.3 3.2-3.2z"/></svg>`,
  brain: `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M15.7505 7.74958C15.7497 7.06714 15.5631 6.39779 15.2108 5.81334C14.8584 5.22889 14.3536 4.75139 13.7505 4.43208C13.7364 3.76966 13.5203 3.12737 13.1309 2.59126C12.7416 2.05515 12.1977 1.65083 11.5722 1.4325C10.9466 1.21417 10.2693 1.19225 9.63091 1.36967C8.99254 1.54709 8.42365 1.91539 8.00047 2.4252C7.5773 1.91539 7.00841 1.54709 6.37004 1.36967C5.73168 1.19225 5.05434 1.21417 4.42878 1.4325C3.80322 1.65083 3.25934 2.05515 2.87002 2.59126C2.48069 3.12737 2.26452 3.76966 2.25047 4.43208C1.64673 4.75053 1.14136 5.22773 0.78883 5.81223C0.436305 6.39673 0.25 7.06637 0.25 7.74895C0.25 8.43153 0.436305 9.10117 0.78883 9.68567C1.14136 10.2702 1.64673 10.7474 2.25047 11.0658C2.26427 11.7283 2.48027 12.3708 2.8695 12.9071C3.25873 13.4434 3.8026 13.8479 4.42821 14.0664C5.05382 14.2849 5.73127 14.3069 6.36975 14.1295C7.00823 13.9522 7.57723 13.5838 8.00047 13.074C8.42372 13.5838 8.99272 13.9522 9.6312 14.1295C10.2697 14.3069 10.9471 14.2849 11.5727 14.0664C12.1983 13.8479 12.7422 13.4434 13.1314 12.9071C13.5207 12.3708 13.7367 11.7283 13.7505 11.0658C14.3538 10.7471 14.8588 10.2699 15.2112 9.68558C15.5636 9.10126 15.7501 8.43193 15.7505 7.74958ZM5.50047 12.7496C5.12287 12.7495 4.75541 12.6273 4.45296 12.4013C4.15051 12.1752 3.92929 11.8573 3.82235 11.4952C3.88485 11.4952 3.94047 11.4996 4.00047 11.4996H4.50047C4.69939 11.4996 4.89015 11.4206 5.0308 11.2799C5.17146 11.1393 5.25047 10.9485 5.25047 10.7496C5.25047 10.5507 5.17146 10.3599 5.0308 10.2192C4.89015 10.0786 4.69939 9.99958 4.50047 9.99958H4.00047C3.46943 9.99995 2.95537 9.81247 2.54924 9.47033C2.14311 9.12818 1.87109 8.65341 1.7813 8.13001C1.69151 7.60661 1.78974 7.06832 2.05861 6.61038C2.32749 6.15243 2.74967 5.80434 3.25047 5.6277C3.39676 5.57598 3.52341 5.48016 3.61296 5.35345C3.70251 5.22673 3.75056 5.07536 3.75047 4.9202V4.49958C3.75047 4.03545 3.93485 3.59033 4.26304 3.26214C4.59123 2.93395 5.03635 2.74958 5.50047 2.74958C5.9646 2.74958 6.40972 2.93395 6.73791 3.26214C7.0661 3.59033 7.25047 4.03545 7.25047 4.49958V8.26083C7.10706 8.16886 6.95659 8.0884 6.80047 8.0202C6.61814 7.94064 6.41166 7.93676 6.22647 8.00943C6.04128 8.0821 5.89254 8.22536 5.81297 8.4077C5.73341 8.59004 5.72954 8.79651 5.80221 8.9817C5.87488 9.1669 6.01814 9.31564 6.20047 9.3952C6.56924 9.55585 6.87141 9.83863 7.05613 10.1959C7.24084 10.5533 7.29683 10.9633 7.21466 11.3571C7.13249 11.7508 6.91718 12.1043 6.60497 12.3579C6.29276 12.6115 5.90271 12.7498 5.50047 12.7496ZM12.0005 9.99958H11.5005C11.3016 9.99958 11.1108 10.0786 10.9701 10.2192C10.8295 10.3599 10.7505 10.5507 10.7505 10.7496C10.7505 10.9485 10.8295 11.1393 10.9701 11.2799C11.1108 11.4206 11.3016 11.4996 11.5005 11.4996H12.0005C12.063 11.4996 12.1192 11.4996 12.1786 11.4952C12.0953 11.7776 11.9421 12.0343 11.7332 12.2418C11.5243 12.4492 11.2665 12.6006 10.9835 12.6819C10.7006 12.7632 10.4017 12.7718 10.1145 12.707C9.82739 12.6421 9.56124 12.5059 9.34073 12.3108C9.12021 12.1158 8.95247 11.8683 8.85301 11.5912C8.75356 11.3141 8.72562 11.0164 8.77176 10.7257C8.81791 10.4349 8.93666 10.1605 9.11703 9.92783C9.29739 9.69516 9.53353 9.51175 9.8036 9.39458C9.98594 9.31501 10.1292 9.16627 10.2019 8.98108C10.2745 8.79589 10.2707 8.58941 10.1911 8.40708C10.1115 8.22474 9.9628 8.08148 9.7776 8.00881C9.59241 7.93614 9.38594 7.94001 9.2036 8.01958C9.04748 8.08777 8.89701 8.16823 8.7536 8.2602V4.49958C8.7536 4.03545 8.93797 3.59033 9.26616 3.26214C9.59435 2.93395 10.0395 2.74958 10.5036 2.74958C10.9677 2.74958 11.4128 2.93395 11.741 3.26214C12.0692 3.59033 12.2536 4.03545 12.2536 4.49958V4.9202C12.2535 5.07536 12.3016 5.22673 12.3911 5.35345C12.4807 5.48016 12.6073 5.57598 12.7536 5.6277C13.2566 5.80275 13.6813 6.15058 13.952 6.60931C14.2226 7.06804 14.3218 7.60792 14.2318 8.13289C14.1418 8.65787 13.8685 9.1339 13.4605 9.47628C13.0525 9.81866 12.5362 10.0052 12.0036 10.0027L12.0005 9.99958ZM13.0005 7.24958C13.0005 7.44849 12.9215 7.63925 12.7808 7.77991C12.6402 7.92056 12.4494 7.99958 12.2505 7.99958C11.5874 7.99958 10.9515 7.73618 10.4827 7.26734C10.0139 6.7985 9.75047 6.16262 9.75047 5.49958V5.24958C9.75047 5.05066 9.82949 4.8599 9.97014 4.71925C10.1108 4.57859 10.3016 4.49958 10.5005 4.49958C10.6994 4.49958 10.8902 4.57859 11.0308 4.71925C11.1715 4.8599 11.2505 5.05066 11.2505 5.24958V5.49958C11.2505 5.76479 11.3558 6.01915 11.5434 6.20668C11.7309 6.39422 11.9853 6.49958 12.2505 6.49958C12.4494 6.49958 12.6402 6.57859 12.7808 6.71925C12.9215 6.8599 13.0005 7.05066 13.0005 7.24958ZM6.25047 5.49958C6.25047 6.16262 5.98708 6.7985 5.51824 7.26734C5.0494 7.73618 4.41352 7.99958 3.75047 7.99958C3.55156 7.99958 3.3608 7.92056 3.22014 7.77991C3.07949 7.63925 3.00047 7.44849 3.00047 7.24958C3.00047 7.05066 3.07949 6.8599 3.22014 6.71925C3.3608 6.57859 3.55156 6.49958 3.75047 6.49958C4.01569 6.49958 4.27004 6.39422 4.45758 6.20668C4.64512 6.01915 4.75047 5.76479 4.75047 5.49958V5.24958C4.75047 5.05066 4.82949 4.8599 4.97014 4.71925C5.1108 4.57859 5.30156 4.49958 5.50047 4.49958C5.69939 4.49958 5.89015 4.57859 6.0308 4.71925C6.17146 4.8599 6.25047 5.05066 6.25047 5.24958V5.49958Z"/></svg>`,
  doc: (lock) => `<span class="c-doc"><svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24"><rect x="1" y="1" width="22" height="22" rx="4" fill="#63c0ff"/><path d="M8 5.5h5.5L17 9v8.5a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1z" fill="none" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/><path d="M13.5 5.5V9H17M9.5 12h5M9.5 15h4" stroke="#fff" stroke-width="1.4" stroke-linecap="round" fill="none"/></svg>${lock||""}</span>`,
  info: `<svg aria-hidden="true" width="12" height="12" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="currentColor"/><rect x="9" y="8.5" width="2" height="6.5" rx="1" fill="#fff"/><circle cx="10" cy="5.8" r="1.25" fill="#fff"/></svg>`,
  arrowDown: FI('<path d="M6 2v8M2.5 6.5L6 10l3.5-3.5"/>', 12, 12, "none", "currentColor", 1.3),
  download: FI('<path d="M8 2v8M4.5 6.5L8 10l3.5-3.5M2.5 10v3.5h11V10"/>', 16, 16, "none", "currentColor", 1.4),
  add: FI('<path d="M8 2.5v11M2.5 8h11"/>', 16, 16, "none", "currentColor", 1.8)
};

/* "Hidden from students" tooltip, Figma 10520:37427: text + preview (student chat with the source / without it) */
const hidTip = (cls, el) => `<div class="htip ${cls||""}" role="tooltip"${el?' data-el="cm.tip" data-label="Tooltip"':""}>
  <p class="htip-t">Hidden material can be used by Brian but students won’t be able to see it. Use it to e.g. hide solutions.</p>
  <div class="htip-prev"><div class="htip-card"><p>But your solution has to be different. You should solve for X.</p><span>Workbook Maths 8 Solutions, p. 3</span>${SPK}</div>
    <div class="htip-card"><p>But your solution has to be different. You should solve for X.</p>${SPK}</div></div></div>`;
const SPK = `<svg class="htip-spk" aria-hidden="true" width="7" height="7" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M1.5 6h2.5l4-3v10l-4-3H1.5z"/><path d="M10.5 6.2c.6.5.6 3.1 0 3.6M12.5 4.8c1.4 1.3 1.4 5.1 0 6.4"/></svg>`;
/* eye icon for hidden material: same tooltip on hover (R6) */
const hidEye = (cls, attrs) => `<span class="${cls} heye" tabindex="0" role="img" aria-label="Hidden from students"${attrs||""}>${IC.eyeOff(16)}</span>`;
/* the hover tooltip lives on the top layer of the screen (one element in .t-app), so no list or dialog can clip it */
function showHidTip(eye){
  const app = eye.closest(".t-app"); if (!app) return;
  let tip = app.querySelector(":scope > .htip.float");
  if (!tip){ const w = document.createElement("div"); w.innerHTML = hidTip("float"); tip = w.firstElementChild; app.appendChild(tip); }
  const a = app.getBoundingClientRect(), r = eye.getBoundingClientRect(), k = a.width / app.offsetWidth || 1;
  const x = (r.right - a.left) / k, y = (r.bottom - a.top) / k, W = 357;
  tip.style.left = Math.max(8, Math.min(x + 12 - W, app.offsetWidth - W - 8)) + "px";
  const below = y + 8, h = tip.offsetHeight || 125;
  tip.style.top = (below + h > app.offsetHeight - 8 ? (r.top - a.top) / k - h - 8 : below) + "px";
  tip.classList.add("on");
}
function hideHidTip(eye){ const app = eye && eye.closest(".t-app"); const tip = app && app.querySelector(":scope > .htip.float"); if (tip) tip.classList.remove("on"); }
document.getElementById("pwrap").addEventListener("mouseover", e => { const eye = e.target.closest && e.target.closest(".heye"); if (eye) showHidTip(eye); });
document.getElementById("pwrap").addEventListener("mouseout", e => { const eye = e.target.closest && e.target.closest(".heye"); if (eye && !eye.contains(e.relatedTarget)) hideHidTip(eye); });
document.getElementById("pwrap").addEventListener("focusin", e => { const eye = e.target.closest && e.target.closest(".heye"); if (eye) showHidTip(eye); });
document.getElementById("pwrap").addEventListener("focusout", e => { const eye = e.target.closest && e.target.closest(".heye"); if (eye) hideHidTip(eye); });

const accessCell = (f, hidden, variant) => {
  const btn = `<button class="sa ${hidden?"hid":""}" data-act="sa" data-id="${f.id}" data-el="cm.access" data-label="Student access toggle" aria-pressed="${hidden}" aria-label="${hidden?"Show":"Hide"} ${esc(f.name)} ${hidden?"to":"from"} students">${hidden?IC.eyeOff(16):IC.eye(16)}${hidden?"Hidden":"Visible"}</button>`;
  if (variant === "v1") return btn;
  return `<span class="sa-rest">${hidden?hidEye("", ' data-el="cm.rest" data-label="Resting: hidden icon"'):""}</span>${btn}`;
};

function teacherShell(inner, overlay, tab, course){
  tab = tab || "Course Materials";
  const nav = (ic, label, on) => `<a class="nav-item ${on?"on":""}" href="#"${on?' aria-current="page"':""}>${ic}<span>${label}</span></a>`;
  return `<div class="t-app ds-teacher">
    <div class="t-side">
      <nav class="t-nav" aria-label="Main">
        <img class="t-logo" src="${IMG_LOGO}" alt="Brian" width="67" height="60">
        <button class="btn ghost t-collapse" aria-label="Collapse menu">${TI.collapse}</button>
        <div class="t-group">${nav(TI.dashboard,"Courses",true)}${nav(TI.library,"Library")}${nav(TI.directory,"Directory")}</div>
        <div class="nav-sep"></div>
        <div class="t-group">${nav(TI.help,"Help Center")}<a class="nav-item" href="#">${TI.language}<span>English</span>${TI.chevron}</a></div>
      </nav>
      <img class="t-avatar" src="${IMG_AVATAR}" alt="Your profile" width="56" height="56">
    </div>
    <main class="t-card">
      <div class="t-top"><div class="t-title"><div class="t-school body-md-strong">Georg Büchner Gymnasium</div><h1 class="h1">${course||"English Grade 7"}</h1></div>
        <span class="btn md">${TI.brain}Preview Course in App</span></div>
      <div class="tab-bar t-tabs" role="tablist" aria-label="Course sections">${(course?["Content","Students","Analytics","Settings"]:["Content","Students","Analytics","Course Materials","Settings"]).map(t => `<span class="tab ${t===tab?"on":""}">${t}</span>`).join("")}</div>
      ${inner}
    </main>
    <div class="t-ask" aria-label="Ask Brian">${TI.sparkle}</div>
    ${overlay||""}</div>`;
}

function courseMaterials(variant, m){
  const files = FILES.concat(m.added ? [NEW_FILE] : []);
  const sel = files.filter(f => m.selected[f.id]);
  const all = sel.length === files.length;
  const colName = variant === "v1" ? "Students" : "Hidden from students";
  /* Figma 10235:40916 (Admin Panel bulk selection): the bar replaces the card footer, light-blue, count left, filled buttons right */
  const bulk = `<div class="t-foot t-bulk" data-el="cm.bulk" data-label="Bulk bar"><b>${sel.length} ${sel.length===1?"document":"documents"} selected</b><span class="x-sp"></span>
      <button class="btn caution" data-act="bulk-del" data-label="Delete (existing)">${FI('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>', 24, 24, "none", "currentColor", 1.7)}Delete (${sel.length})</button>
      <button class="btn" data-act="bulk-show" data-el="cm.bulkShow" data-label="Show to students">Show to students</button>
      <button class="btn" data-act="bulk-hide" data-el="cm.bulkHide" data-label="Hide from students">Hide from students</button></div>`;
  const rows = files.map(f => {
    const hidden = !!m.hidden[f.id];
    return `<tr class="${m.selected[f.id]?"sel":""} ${m.hover===f.id?"hov":""}">
      <td class="c-cb"><input type="checkbox" data-act="sel" data-id="${f.id}" ${m.selected[f.id]?"checked":""} aria-label="Select ${esc(f.name)}"></td>
      <td><div class="c-fn">${TI.doc()}<span class="c-tx">${esc(f.name)}</span></div></td>
      <td><span class="c-tx">11.09.2026</span></td><td><span class="c-tx">Klasse 7</span></td><td><span class="c-tx">${esc(f.usedIn)}</span></td>
      <td>${accessCell(f, hidden, variant)}</td>
      <td><button class="btn ghost c-dl" aria-label="Download ${esc(f.name)}">${TI.download}</button></td></tr>`;
  }).join("");
  const tip = m.tip ? hidTip("c-tip", true) : "";
  return `<div class="t-cm ${variant}">
    <div class="t-tablewrap"><table class="table t-table" aria-label="Course materials"><colgroup><col style="width:28px"><col style="width:26%"><col><col><col style="width:20%"><col style="width:15%"><col style="width:96px"></colgroup><thead><tr>
      <th class="c-cb"><input type="checkbox" data-act="sel-all" ${all?"checked":""} aria-label="Select all files"></th>
      <th>Filename</th><th>Uploaded</th><th>Tags</th><th><div class="c-sort">Used In${TI.arrowDown}</div></th>
      <th><div class="c-acc"><span data-el="cm.col" data-label="Column name">${colName}</span><button class="info-icon" data-act="tip" aria-expanded="${!!m.tip}" aria-label="What does hidden mean?" data-el="cm.info" data-label="Info icon">${TI.info}</button>${tip}</div></th>
      <th>Download</th></tr></thead><tbody>${rows}</tbody></table></div>
    ${sel.length ? bulk : `<div class="t-foot"><button class="btn" data-act="add" data-el="cm.add" data-label="Add Course Material">${TI.add}Add Course Material</button></div>`}</div>`;
}

function uploadDialog(){
  return `<div class="dim"><div class="dlg" role="dialog" aria-label="Add Course Material" style="width:640px">
    <div class="dlg-h"><h2>Add Course Material</h2><button data-act="up-close" aria-label="Close">${IC.close(18)}</button></div>
    <div class="dlg-b">
      <div class="frow"><span class="fi" style="width:32px;height:32px;margin:0">${IC.file(16)}</span><div style="flex:1;display:flex;flex-direction:column"><b style="font-size:14px">${esc(NEW_FILE.name)}</b><span style="font-size:12px;color:#585858">2.4 MB · uploaded</span></div><span style="color:#157ec5">${IC.check(20)}</span></div>
      <div class="callout" data-el="up.callout" data-label="Solutions hint"><span class="lkc">${IC.eyeOff(16)}</span><div style="display:flex;flex-direction:column;gap:6px"><b style="font-size:16px;font-weight:800">This looks like a solutions file</b><span style="font-size:14px;line-height:1.45">Hide it from students? Brian can still use it to check answers, but students can't open it when Brian cites it.</span></div></div>
      <span style="font-size:13px;color:#585858">You can change this anytime in Course Materials.</span>
    </div>
    <div class="dlg-f"><button class="btn secondary" data-act="up-keep" data-el="up.keep" data-label="Keep visible">Keep visible</button><button class="btn preferred" data-act="up-hide" data-el="up.hide" data-label="Hide from students">Hide from students</button></div>
  </div></div>`;
}

/* Edit Knowledge Base: layout from Figma 10500:25996 (dialog over the AI Dialogue Content tab) and 10452:224 (Uploads Table) */
const IMG_BOOK="data:image/png;base64,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";
const KBI = {
  link: `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>`,
  info12: `<svg aria-hidden="true" width="12" height="12" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#63c0ff"/><rect x="9" y="8.5" width="2" height="6.5" rx="1" fill="#fff"/><circle cx="10" cy="5.8" r="1.25" fill="#fff"/></svg>`,
  close24: `<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>`,
  arrowR: `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 8h11M9.5 4l4 4-4 4"/></svg>`,
  caretUp: `<svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7.5L6 4.5l3 3"/></svg>`,
  caretDown: `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l4 4 4-4"/></svg>`,
  pen: `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 2.5l3 3L5 14H2v-3z"/></svg>`,
  sparkles: `<svg aria-hidden="true" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linejoin="round"><path d="M15 3c.4 2.9 1.6 4.1 4.5 4.5-2.9.4-4.1 1.6-4.5 4.5-.4-2.9-1.6-4.1-4.5-4.5 2.9-.4 4.1-1.6 4.5-4.5zM7 11c.3 2 1.1 2.8 3 3-1.9.3-2.7 1.1-3 3-.3-1.9-1.1-2.7-3-3 1.9-.2 2.7-1 3-3zM17 15c.2 1.3.8 1.9 2 2-1.2.2-1.8.8-2 2-.2-1.2-.8-1.8-2-2 1.2-.1 1.8-.7 2-2zM5 4c.2 1 .6 1.4 1.5 1.5C5.6 5.6 5.2 6 5 7c-.2-1-.6-1.4-1.5-1.5C4.4 5.4 4.8 5 5 4z"/></svg>`,
  doc: `<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24"><rect x="1.5" y="1.5" width="21" height="21" rx="4" fill="#63c0ff"/><path d="M8.5 6h5L16.5 9v8.5a.5.5 0 0 1-.5.5H8.5a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5z" fill="none" stroke="#fff" stroke-width="1.3" stroke-linejoin="round"/><path d="M13.5 6v3h3M10 12h4.5M10 14.8h3.5" stroke="#fff" stroke-width="1.3" stroke-linecap="round" fill="none"/></svg>`
};
const kbCheck = (on, attrs) => `<input type="checkbox" class="kb-cb" ${on?"checked":""} ${attrs||""}>`;

/* background: AI Dialogue, Content tab, Manual mode (Figma 10500:25996) */
function dialogueContent(){
  const label = (t, info=true) => `<div class="ac-label">${esc(t)}${info?KBI.info12:""}</div>`;
  return `<div class="ac">
    <div class="ac-bar"><div class="ac-crumbs"><span>Content</span>${KBI.arrowR}<span>Creating Linear Functions</span><span class="ac-copy">${KBI.link}Copy link for students</span></div>
      <span class="ac-active">Active${KBI.caretUp}</span></div>
    <div class="ac-main">
      <div class="ac-left">
        <div class="ac-seg"><span>Chatbot</span><span class="on">Manual</span></div>
        <div class="ac-panel">
          <div class="ac-group">${label("Instructions for learners")}<div class="ac-field">This is your check-in on rational numbers. You'll check whether you can read numbers off a number line, mark them on it, and put them in order by size. You'll also show whether you can add and subtract in your head and explain how you worked things out.</div></div>
          <div class="ac-group">${label("Internal Instruction for Chatbot")}<div class="ac-field ac-clip"><b>Type and goal</b><br>Conduct a short, fully spoken A1 conversation for the first English lesson. The learner practices greeting, introducing themselves, and asking simple questions in conversation rather than through a long list of quiz questions.<br><br><b>Language framework</b><br>In your English utterances, use only the 20 words and phrases from the practice context.</div></div>
          <div class="ac-group">${label("When does the dialog end?")}<div class="ac-field">The exercise only ends once the learner has said, in a short conversation, the greeting, the introduction, a simple question, and the farewell, each one themselves in English. German answers do not count toward any of these requirements.</div></div>
          <div class="ac-group">${label("Knowledge Base")}<div class="ac-kb"><span class="ac-kbic">${KBI.link}<i>31</i></span><span class="ac-kbtx">All course materials</span><span class="ac-edit">Edit</span></div></div>
          <div class="ac-group">${label("Evaluation Schema")}<div class="ac-row"><span class="ac-btn">${KBI.pen}Adapt Evaluation Rubrics</span><span class="ac-select">German${KBI.caretDown}</span></div></div>
        </div>
      </div>
      <div class="ac-right"><div class="ac-prevh">Student Preview</div><div class="ac-prev">${KBI.sparkles}<span>Complete the creation to preview the AI Dialogue</span></div></div>
    </div></div>`;
}

function kbDialog(m){
  const files = FILES;
  const sync = m.kbSync;
  const custom = m.kbCustom;
  const n = sync ? files.length : files.filter(f => custom[f.id]).length;
  const rows = files.map(f => {
    const hidden = !!m.hidden[f.id]; const on = sync || !!custom[f.id];
    return `<div class="kb-row">${kbCheck(on, `${sync?"disabled":""} data-act="kb-pick" data-id="${f.id}" aria-label="${esc(f.name)}"`)}
      <span class="kb-doc">${KBI.doc}</span><span class="kb-name">${esc(f.name)}</span>
      ${hidden?hidEye("kb-hid", f.id==="s"?' data-el="kb.tag" data-label="Hidden icon"':""):""}</div>`;
  }).join("");
  return `<div class="dim"><div class="dlg kb-dlg" role="dialog" aria-label="Edit Knowledge Base">
    <div class="kbd-h"><h2>Edit Knowledge Base</h2><button data-act="kb-close" aria-label="Close">${KBI.close24}</button></div>
    <div class="kbd-b">
      <div class="kb-up"><div class="kb-seg"><span class="on">Drag &amp; Drop</span><span>Copy &amp; Paste</span><span>Video</span><span>Website</span></div>
        <div class="kb-drop"><img src="${IMG_BOOK}" alt="" width="80" height="105"><div class="kb-dropt"><p class="kb-dropb">Drag &amp; Drop<br>or <span>browse for a file</span></p><p>(.tiff, .md, .webp, .heif, .pages, .pdf, .key, .svg, .jpeg, .tif, .ods, .heic, .xls, .htm, .ppt, .pptx, .xlsx, .odt, .png, .txt, .numbers, .odp, .jpe, .html, .jpg, .doc, .rtf, .docx, .bmp)</p></div></div></div>
      <div class="kb-list ${sync?"kb-synced":""}">
        <div class="kb-head">
          <div class="kb-title">${KBI.link}<b>Sync with course materials</b>${KBI.info12}<span class="x-sp"></span>
            <button class="sw ${sync?"on":""}" role="switch" aria-checked="${sync}" aria-label="Sync with course materials" data-act="kb-sync" data-el="kb.toggle" data-label="Sync toggle"></button></div>
          <p class="kb-desc" data-el="kb.copy" data-label="Sync description">${sync?"All course materials are added and removed automatically, including material that is hidden from students.":"Choose the documents this activity uses. Your selection won't change when the course materials change."}</p>
        </div>
        <div class="kb-all">${kbCheck(sync||n===files.length, `${sync?"disabled":""} aria-label="Select all"`)}<b>Select all</b><span class="x-sp"></span><span class="kb-n">${n} selected</span></div>
        <div class="kb-rows">${rows}</div>
      </div>
    </div>
    <div class="kbd-f"><button class="btn" ${m.kbDirty?"":"disabled"} data-act="kb-close">Apply Changes</button></div>
  </div></div>`;
}

/* Quiz · activity instructions page with Attached Files (Figma 10520:43974) */
const QZI = {
  video: `<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24"><rect x="1.5" y="1.5" width="21" height="21" rx="4" fill="#63c0ff"/><path d="M9.6 8.2l6.2 3.8-6.2 3.8z" fill="none" stroke="#fff" stroke-width="1.3" stroke-linejoin="round"/></svg>`,
  text: `<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24"><rect x="1.5" y="1.5" width="21" height="21" rx="4" fill="#63c0ff"/><path d="M8 9h8M8 12h8M8 15h5" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/></svg>`,
  play: `<svg aria-hidden="true" width="56" height="40" viewBox="0 0 56 40"><rect width="56" height="40" rx="10" fill="#e33"/><path d="M23 13l11 7-11 7z" fill="#fff"/></svg>`
};
const QZ_FILES = [
  { id:"qv", name:"Plus & Minus", meta:"Video - retrieved: 06.08.2026", icon:"video", hidden:true },
  { id:"qw", name:"Rational Numbers - Exercise 3A", meta:"Website - retrieved: 06.08.2026", icon:"text", hidden:true },
  { id:"qd", name:"Plus & Minus", meta:"Page 1-5 - uploaded: DD.MM.YYYY", icon:"doc", hidden:false }
];
function quizPage(m){
  const label = (t, info) => `<div class="ac-label">${esc(t)}${info?KBI.info12:""}</div>`;
  const rows = QZ_FILES.map(f => {
    const hid = m.qzHidden ? !!m.qzHidden[f.id] : f.hidden;
    const ic = f.icon === "video" ? QZI.video : f.icon === "text" ? QZI.text : KBI.doc;
    return `<div class="qz-row ${hid?"hid":""}"><span class="qz-ic">${ic}</span><div class="qz-tx"><b>${esc(f.name)}</b><span>${esc(f.meta)}</span></div>
      ${hid?hidEye("qz-eye", f.id==="qv"?' data-el="qz.hidden" data-label="Hidden attached file"':""):""}</div>`;
  }).join("");
  return `<div class="ac qz">
    <div class="ac-bar"><div class="ac-crumbs"><span>Content</span>${KBI.arrowR}<span>Quiz</span><span class="ac-copy">${KBI.link}Copy link for students</span></div>
      <span class="ac-active">Active${KBI.caretUp}</span></div>
    <div class="qz-body">
      <div class="qz-g">${label("Name")}<div class="qz-name">Plus and Minus - Check-In</div></div>
      <div class="qz-g">${label("Context")}<div class="qz-ctx"><div class="qz-video"><span>Integers: adding and subtracting</span>${QZI.play}</div><p>In diesem Quiz übst du das Addieren und Subtrahieren ganzer Zahlen mit positiven und negativen Vorzeichen.</p></div></div>
      <div class="qz-g"><div class="ac-label qz-lbl"><span class="qz-l">Attached Files${KBI.info12}</span><span class="qz-show">Show attached files${KBI.info12}<button class="sw ${m.qzShow===false?"":"on"}" role="switch" aria-checked="${m.qzShow!==false}" aria-label="Show attached files" data-act="qz-show"></button></span></div>
        <div class="qz-list" data-el="qz.list" data-label="Attached Files list">${rows}</div></div>
    </div></div>`;
}

/* Student app · AI Tutor chat: Figma 10513:30436 (Default 10513:30842, Hidden 10520:40919), 402×874 */
const IMG_DRAWING="data:image/png;base64,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";
const IMG_TABBAR="data:image/png;base64,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";
const SI = {
  menu: `<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 6h16M4 10h16M4 14h16M4 18h10"/></svg>`,
  plusCircle: `<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 7.5v9M7.5 12h9"/></svg>`,
  speaker: `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round" stroke-linecap="round"><path d="M1.5 6h2.5l4-3v10l-4-3H1.5z"/><path d="M10.5 6.2c.6.5.6 3.1 0 3.6M12.5 4.8c1.4 1.3 1.4 5.1 0 6.4"/></svg>`,
  add: `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"><path d="M8 3v10M3 8h10"/></svg>`,
  send: `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#fff" stroke-width="1.3" stroke-linejoin="round"><path d="M2.5 2.8l11 5.2-11 5.2 1.8-5.2z"/><path d="M4.3 8h4.2" stroke-linecap="round"/></svg>`,
  status: `<svg aria-hidden="true" width="70" height="12" viewBox="0 0 70 12"><g fill="#3a3a3a"><rect x="0" y="7" width="3" height="4" rx=".7"/><rect x="4.5" y="5" width="3" height="6" rx=".7"/><rect x="9" y="3" width="3" height="8" rx=".7"/><rect x="13.5" y="1" width="3" height="10" rx=".7"/></g><path d="M23 4.3a8.5 8.5 0 0 1 11.5 0M25.2 6.6a5.3 5.3 0 0 1 7.1 0M27.4 8.8a2 2 0 0 1 2.7 0" fill="none" stroke="#3a3a3a" stroke-width="1.5" stroke-linecap="round"/><rect x="44.5" y=".5" width="20" height="11" rx="2.7" fill="none" stroke="#3a3a3a" opacity=".35"/><rect x="46.5" y="2.5" width="16" height="7" rx="1.3" fill="#3a3a3a"/><rect x="65.8" y="4" width="1.2" height="4" rx=".6" fill="#3a3a3a" opacity=".4"/></svg>`
};
const sMe = (text, asset) => `<div class="s-me">${asset||""}${text?`<p>${text}</p>`:""}<i class="s-wl"></i></div>`;
const sTutor = (inner) => `<div class="s-tutor"><div class="s-tc">${inner}</div><div class="s-act">${SI.speaker}</div></div>`;
const sP = t => `<p class="s-p">${t}</p>`;

function student(m){
  const hidden = !!m.stHid;
  /* Figma 10520:40919: hidden material is never cited. Brian says it in his own words, with no source line under it */
  const src2 = hidden ? "" : `<button class="s-src" data-act="st-vis" data-el="st.chipVisible" data-label="Source link">Workbook Maths 8 Solutions, p. 3</button>`;
  const pdf = m.stPdf ? `<div class="pdf"><div class="pdf-sheet"><div class="pdf-h"><span>Workbook Maths 8 Solutions.pdf · p. 3</span><button class="x-ib" data-act="st-pdf-close" aria-label="Close">${IC.close(18)}</button></div>
      <div class="pdf-page"><b style="color:#3a3a3a;font-size:14px">Solutions · Linear functions</b><span>3a) y = 2x + 3</span><mark>3b) Solve for x: x = (y − 3) / 2</mark><span>3c) m = −1, b = 4</span></div></div></div>` : "";
  return `<div class="s-app">
    <div class="s-scroll">
      ${sMe("I don’t understand. Can you explain it to me again?")}
      ${sTutor(sP("Good sketch, Alex. You found the two key parts of a linear function. Let's check them against your workbook.") +
        `<div class="s-cit"><p class="s-p">On page 42 your workbook explains it like this:</p><div class="s-cit1"><div class="s-quote"><i></i><p>»A linear function has the form y = mx + b. The number m is the slope and b is the y-intercept.«</p></div><button class="s-src" data-act="st-vis">Workbook Maths 8, p. 42</button></div></div>` +
        (hidden ? `<div class="s-cit" data-el="st.chipHidden" data-label="Answer from hidden material (no citation)"><p class="s-p">But your solution has to be different. You should solve for X.</p></div>`
                : `<div class="s-cit"><p class="s-p">But your solution has to be different. You should solve for X.</p><div class="s-cit1">${src2}</div></div>`) +
        sP("Can you write the line as an equation of the form y = mx + b?"))}
      ${sMe("I drew it into a coordinate system. The line crosses the y-axis at 3.", `<div class="s-asset"><img src="${IMG_DRAWING}" alt="Drawing: 4 × 4 = 16" width="320" height="185"><span>Canvas</span></div>`)}
      <div class="s-day"><i></i><span>Today</span><i></i></div>
      ${sTutor(sP("Thanks, Alex. Both equations are correct. In short, the slope tells you how steep the line is, and the y-intercept tells you where it starts.") +
        `<div class="s-cit s-ind"><p class="s-p">Your workbook says that the slope m is the change in y for every step to the right in x.¹</p><div class="s-fn"><span>1</span><button class="s-src" data-act="st-vis">Workbook Maths 8, p. 42</button></div></div>` +
        sP("Do you want to try another equation?"))}
      <div class="s-typing"><span class="s-ava"></span><i></i><i></i><i></i></div>
    </div>
    <div class="s-nav"><div class="s-status"><b>9:41</b>${SI.status}</div><div class="s-head">${SI.menu}<b>AI-Tutor</b>${SI.plusCircle}</div></div>
    <div class="s-input"><span class="s-plus">${SI.add}</span><div class="s-field"><span>Or ask anything...</span><span class="s-send">${SI.send}</span></div></div>
    <img class="s-tabbar" src="${IMG_TABBAR}" alt="" width="402" height="83">
    ${pdf}</div>`;
}


/* ================= spec defaults ================= */
const ul = (...items) => `<ul>${items.map(i => Array.isArray(i) ? `<li>${i[0]}<ul>${i.slice(1).map(x=>`<li>${x}</li>`).join("")}</ul></li>` : `<li>${i}</li>`).join("")}</ul>`;
const DOCS = {
    brief: "<h4>Problem</h4>" + ul("Teachers upload solutions and teacher notes as course material", ["Brian cites them, and students can open the cited PDF", "So solutions leak through the citation"]) +
      "<h4>Goal</h4>" + ul("Brian uses all course material", "Teachers choose per file whether students can open it") +
      "<h4>Out of scope</h4>" + ul("Splitting or redacting solution sections of a document (later idea)"),
    rules: ul("<b>R1</b> \"Hidden from students\" only controls what students can open, never what Brian uses",
      "<b>R2</b> New material is visible by default",
      ["<b>R3</b> Hidden files: the server sends no PDF link and no quote to the app", "Follow-up ticket (Student + Backend)"],
      ["<b>R4</b> Teacher side: hidden material is marked only with the crossed-out eye icon", "Everywhere a file is listed (Course Materials, Edit Knowledge Base)", "No lock badge, no tag, no text at rest"],
      "<b>R4</b> Lock badge on a file icon means hidden, nothing else"),
    edges: ul(["Existing data", "\"Available to AI Tutor\" unchecked → hidden", "Checked → visible"],
      "Course AI Tutor uses all course material",
      ["Quiz source material students can't see", "Stays in the knowledge base, treated like hidden"]),
    ds: ul("Uploads Table: new column \"Student access\" with hover toggle (V2)", "Citation chip: new hidden state (Student app)"),
    questions: ul("Column name: \"Student access\" or \"Visible to students\"?", "Hover toggle: does it also need a keyboard path beyond focus (e.g. row menu)?", "Solutions detection: file name only, or also content?")
  };
const STATE_DOCS = {
    "cm-rest": ul("Column \"Student access\" with info icon", ["Hidden files", "Show only the crossed-out eye icon, no text", "No lock badge on the file icon (Hannes 24.11)"], "Visible files show nothing in the column"),
    "cm-hover": ul(["Row hover or keyboard focus in the row", "Toggle appears in the column", "Visible file: \"Visible\" with eye icon"], "Click toggles the state, row stays hovered"),
    "cm-hover-h": ul(["Hidden file on hover", "Toggle shows \"Hidden\" with crossed-out eye", "Light grey, not dark (Hannes 20.11)"], "Click → visible"),
    "cm-tip": ul("Tooltip on the info icon", ["Copy", "\"Brian still uses hidden material, but students can't open it when Brian cites it.\"", "\"Use this for solutions or teacher notes.\""]),
    "cm-bulk": ul(["One or more rows selected", "Bulk bar replaces the card footer (style as Admin Panel, Figma 10235:40916)", "Count left; right: existing \"Delete (n)\", then \"Show to students\" / \"Hide from students\""], "After the action the selection clears"),
    "up-detect": ul(["Uploaded file name looks like solutions", "\"Lösung\", \"Solution\", \"Answer key\", \"Musterlösung\""], ["Ask once", "\"Keep visible\" / \"Hide from students\""], "Can be changed anytime in Course Materials"),
    "kb-sync": ul(["Toggle on", "List read-only, all files ticked"], "Description: \"All course materials are added and removed automatically, including material that is hidden from students.\"", "Hidden files show only the crossed-out eye icon, as in Course Materials (Hannes 24.11)"),
    "kb-custom": ul("Toggle off: list active, as in \"Update - 18.11.26\" of this ticket (BR-6891)", "Crossed-out eye stays visible so the teacher knows students can't open those files"),
    "qz-files": ul("Attached Files on the quiz's instructions page", ["Hidden files", "Grey row (light grey background), icon and text faded", "Crossed-out eye on the right, no text"], "Visible files look as before", "\"Show attached files\" toggle unchanged: hidden files stay hidden from students even when it is on"),
    "st-vis": ul(["Source under a citation", "Grey text (\"Workbook Maths 8 Solutions, p. 3\")", "Tap opens the PDF at the cited page"]),
    "st-hid": ul(["Answer draws on hidden material", "Brian says it in his own words, no citation", "No source line, no quote, no marker"], "Attaching material in the chat: hidden material is hidden there as well", "Follow-up ticket (Student + Backend)")
  };
const MODES = [
  { id:"cm", name:"Course Materials", ctx:"cms", device:"desktop", figma:FIG("10491-24801"), states:[["cm-rest","Resting"],["cm-hover","Row hover (visible file)"],["cm-hover-h","Row hover (hidden file)"],["cm-tip","Info tooltip"],["cm-bulk","Rows selected"]] },
  { id:"up", name:"Upload", ctx:"cms", device:"desktop", figma:"", states:[["up-detect","Solutions detected"]] },
  { id:"kb", name:"Edit Knowledge Base", ctx:"kb", device:"desktop", figma:FIG("10442-5055"), states:[["kb-sync","Synced (toggle on)"],["kb-custom","Custom selection"]] },
  { id:"qz", name:"Quiz · Attached Files", ctx:"quiz", device:"desktop", figma:FIG("10520-43974"), states:[["qz-files","Attached files"]] },
  { id:"st", name:"Student · AI Tutor", ctx:"student", device:"phone", figma:FIG("10520-40919"), states:[["st-vis","Default (source visible)"],["st-hid","Hidden (no citation)"]] }
];
const DEFAULT = { v:2, docs:Object.assign({}, DOCS),
  modes: MODES.map(m => ({ id:m.id, name:m.name, status:"open", figma:m.figma, states:m.states.map(([id,name]) => ({ id, name, kind:id, doc:STATE_DOCS[id]||"", links:{} })) })) };
const VARIANTS = [ { id:"v1", name:"Toggle always" }, { id:"v2", name:"Hover only" } ];
const CONTEXTS = [
  { id:"cms", name:"Course Materials", ctx:"cms", figma:FIG("10491-24801") },
  { id:"kb", name:"AI Dialogue · Knowledge Base", ctx:"kb", figma:FIG("10442-5055") },
  { id:"quiz", name:"Quiz · Attached Files", ctx:"quiz", figma:FIG("10520-43974") },
  { id:"student", name:"Student · AI Tutor / Chatbot", ctx:"student" }
];
const EL_ORDER = ["cm.col","cm.info","cm.rest","cm.access","cm.tip","cm.bulk","cm.bulkHide","cm.bulkShow","up.callout","up.keep","up.hide","kb.toggle","kb.copy","kb.tag","qz.list","qz.hidden","st.chipVisible","st.chipHidden","cm.add"];
const DEVICES = { desktop:{ w:1720, h:1080 }, phone:{ w:402, h:874 } };
const META = id => MODES.find(m => m.id === id) || MODES[0];

/* data from the first BR-6891 workbench (its own format, 20.11.26 morning) */
function migrate(old){
  const d = structuredClone(DEFAULT); if (!old || !old.docs) return d;
  Object.assign(d.docs, old.docs);
  for (const m of d.modes){ if (old.modeStatus && old.modeStatus[m.id]) m.status = old.modeStatus[m.id];
    for (const s of m.states){ const o = old.states && old.states[s.id]; if (o && typeof o.doc === "string") s.doc = o.doc; } }
  if (old.elnums) d.elnums = Object.assign({}, old.elnums);
  return d;
}

/* ================= prototype model ================= */
function preset(stateId, m){
    const base = { hidden: m.hidden || { s:true, t:true, k:true }, added: !!m.added, selected:{}, tip:false, hover:null,
      kbSync: true, kbCustom: { b:true, e:true, i:true, v:true, s:true }, kbDirty:false, stPop:false, stPdf:false, stHid:false };
    if (stateId === "cm-hover") base.hover = "e";
    if (stateId === "cm-hover-h") base.hover = "s";
    if (stateId === "cm-tip") base.tip = true;
    if (stateId === "cm-bulk") base.selected = { b:true, v:true };
    if (stateId === "kb-custom") base.kbSync = false;
    if (stateId === "st-hid") base.stHid = true;
    
    return base;
}
const KEEP = { hidden:null, added:false };      /* teacher choices survive switching screens */
function seed(kind){ const m = preset(kind, { hidden:KEEP.hidden, added:KEEP.added }); m._m = 1; return m; }
function ensureModel(){ if (!ui.live || !ui.live._m){ const st = curState(); ui.live = seed(st ? st.kind : "cm-rest"); } return ui.live; }
function screen(stateId, variant, m){
    const mode = stateId.split("-")[0];
    if (mode === "cm") return teacherShell(courseMaterials(variant, m));
    if (mode === "up") return teacherShell(courseMaterials(variant, m), uploadDialog());
    if (mode === "kb") return teacherShell(dialogueContent(), kbDialog(m), "Content");
    if (mode === "qz") return teacherShell(quizPage(m), "", "Content", "Maths Grade 7");
    if (mode === "st") return student(m);
    return `<div style="height:100%;display:flex;align-items:center;justify-content:center;font:600 16px Nunito,sans-serif;color:#858585">New screen · spec it on the right</div>`;
}

/* ================= stage ================= */
const stageEl = document.getElementById("stage");
function stateMode(st){ const x = find(st.id); return META(x ? x.m.id : "cm"); }
function phoneHTML(st, live, interactive){
  const M = live && live._m ? live : seed(st.kind); const meta = stateMode(st), dev = DEVICES[meta.device];
  return `<div class="phone fx dev-${meta.device}" style="width:${dev.w}px;height:${dev.h}px">${screen(st.kind, ui.variant, M)}</div>`;
}
let lastSelState = null;
function syncContext(){
  const want = META(curMode().id).ctx;
  if (ui.sel.state !== lastSelState){ lastSelState = ui.sel.state; if (ui.context !== want){ ui.context = want; try{ renderHeader(); }catch(e){} } return; }
  if (ui.context !== want){ const m = S.modes.find(x => META(x.id).ctx === ui.context); if (!m) return;
    ui.sel = { kind:"state", mode:m.id, state:m.states[0].id }; lastSelState = ui.sel.state; ui.live = seed(m.states[0].kind);
    try{ markActive(); renderLeft(); scrollToSel(); }catch(e){} }
}
function renderStage(){
  const W = document.getElementById("pwrap"); const st = curState(); if (!st){ W.innerHTML = ""; return; }
  syncContext(); const M = ensureModel();
  W.innerHTML = `<svg class="lines" id="lines"></svg>${phoneHTML(curState(), M, true)}`;
  fit(); placeBadges(); renderMinimap(); setTimeout(() => { try{ placeAgtDots(); updTpBadges(); }catch(e){} }, 30);
}
function fit(){
  const st = document.getElementById("stage"), w = document.getElementById("pwrap"), ph = w && w.querySelector(".phone"); if (!ph) return;
  const pv = document.body.classList.contains("proto");
  const sc = Math.min((st.clientWidth - (pv ? 32 : 64)) / ph.offsetWidth, (st.clientHeight - (pv ? 32 : 112)) / ph.offsetHeight, pv ? 1.4 : 1);
  w.style.transform = `translate(-50%,-50%) scale(${sc})`; ui.scale = sc;
}
window.addEventListener("resize", () => { fit(); try{ placeAiCtl(); }catch(e){} });
function placeBadges(){ ui.elCount = document.querySelectorAll("#pwrap .phone [data-el]").length; }
function refreshCoverage(){
  document.querySelectorAll(".sec-cov[data-state]").forEach(c => { const f = find(c.dataset.state); if (f){ const v = covOf(f.s); c.textContent = v.n ? `${v.c}/${v.n}` : ""; } });
  renderLeft();
}
function go(stateId){ const x = find(stateId); if (!x) return; ui.sel = { kind:"state", mode:x.m.id, state:x.s.id }; ui.live = seed(x.s.kind); render(); scrollToSel(); }
async function loadPreviews(){}

/* ================= prototype behaviour ================= */
const api = {
  get model(){ return ensureModel(); },
  set(patch, stateId){
    Object.assign(ui.live, patch);
    if (patch.hidden) KEEP.hidden = Object.assign({}, patch.hidden);
    if (patch.added) KEEP.added = true;
    if (stateId && stateId !== ui.sel.state){ const x = find(stateId);
      if (x){ ui.sel = { kind:"state", mode:x.m.id, state:stateId }; lastSelState = stateId; renderStage(); markActive(); renderLeft(); renderHeader();
        if (document.body.classList.contains("attn-proto")) scrollToSel(); return; } }
    renderStage();
  },
  go(id){ go(id); }
};
function act(t){
    const a = t.dataset.act, m = api.model, id = t.dataset.id;
    const h = Object.assign({}, m.hidden), s = Object.assign({}, m.selected);
    if (a === "sa"){ h[id] = !h[id]; api.set({ hidden:h }); }
    else if (a === "sel"){ s[id] = !s[id]; const any = Object.values(s).some(Boolean); api.set({ selected:s }, any ? "cm-bulk" : "cm-rest"); }
    else if (a === "sel-all"){ const files = FILES.concat(m.added?[NEW_FILE]:[]); const all = files.every(f => s[f.id]); const n = {}; if (!all) files.forEach(f => n[f.id] = true); api.set({ selected:n }, all ? "cm-rest" : "cm-bulk"); }
    else if (a === "bulk-hide" || a === "bulk-show"){ Object.keys(s).forEach(k => { if (s[k]) h[k] = a === "bulk-hide"; }); api.set({ hidden:h, selected:{} }, "cm-rest"); }
    else if (a === "tip"){ api.set({ tip: !m.tip }, m.tip ? "cm-rest" : "cm-tip"); }
    else if (a === "add"){ api.go("up-detect"); }
    else if (a === "up-keep" || a === "up-hide"){ h.n = a === "up-hide"; api.set({ hidden:h, added:true }, "cm-rest"); }
    else if (a === "up-close" || a === "kb-close"){ api.go("cm-rest"); }
    else if (a === "kb-sync"){ api.set({ kbSync: !m.kbSync, kbDirty:true }, m.kbSync ? "kb-custom" : "kb-sync"); }
    else if (a === "kb-pick"){ const c = Object.assign({}, m.kbCustom); c[id] = !c[id]; api.set({ kbCustom:c, kbDirty:true }); }
    
    else if (a === "qz-show"){ api.set({ qzShow: m.qzShow === false }); }
    else if (a === "st-vis"){ api.set({ stPdf:true }); }
    else if (a === "st-pdf-close"){ api.set({ stPdf:false }); }
}
document.getElementById("pwrap").addEventListener("click", e => {
  if (ui.commenting || e.altKey) return;
  const t = e.target.closest("[data-act]"); if (!t) return;
  if (t.tagName !== "INPUT") e.preventDefault();
  ensureModel(); act(t);
});
