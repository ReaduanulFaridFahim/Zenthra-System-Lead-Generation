window.STATIC_RAG_DOCUMENTS = [
  {
    "key": "logistics_sop",
    "title": "Global Supply Chain & Reefer Logistics SOP (v4.2)",
    "category": "Logistics & Cold Chain",
    "sections": [
      {
        "id": "sec_reefer_temp",
        "heading": "Section 4.1: Cold Chain Temperature Thresholds & Alarm Policies",
        "content": "Pharmaceutical and perishable food cargo in refrigerated containers (reefers) must maintain continuous telemetry logging at -20°C (±1.5°C) for frozen bio-assays and +2°C to +8°C for clinical vaccines. If container temperature drifts by > 2.0°C for more than 45 consecutive minutes, an automated Level 1 telemetry alert is dispatched to dispatch coordinators and the port cold-storage buffer facility. Failure to notify port authorities within 2 hours triggers mandatory cargo quarantine under Maritime Food & Drug Protocol 18.",
        "keywords": [
          "temperature",
          "reefer",
          "cold chain",
          "threshold",
          "alarm",
          "quarantine",
          "vaccine",
          "perishable"
        ]
      },
      {
        "id": "sec_port_demurrage",
        "heading": "Section 6.3: Port Demurrage & Detention Liability Caps",
        "content": "Standard free demurrage allowance at major international transshipment hubs (Chittagong, Rotterdam, Singapore, Jebel Ali) is strictly 5 calendar days following vessel discharge. Unclaimed container dwell time beginning on Day 6 incurs detention billing of $185 USD per TEU per day for dry cargo, and $340 USD per day for temperature-controlled reefers. Maximum aggregate liability per shipper bill of lading is capped at $45,000 USD, unless customs hold is resulting from undeclared hazardous materials (HAZMAT Class 3/8).",
        "keywords": [
          "demurrage",
          "detention",
          "penalty",
          "fee",
          "free time",
          "liability",
          "chittagong",
          "rotterdam",
          "teu"
        ]
      },
      {
        "id": "sec_customs_clearance",
        "heading": "Section 8.2: Automated Customs Clearance Intake",
        "content": "Digital Bill of Lading (e-BOL) and commercial packing lists must be transmitted via EDI 856 or API payload at least 48 hours prior to vessel estimated time of arrival (ETA). Manual paper documentation intake is subject to a $250 administrative verification surcharge and a minimum 72-hour physical inspection turnaround delay.",
        "keywords": [
          "customs",
          "clearance",
          "ebol",
          "edi",
          "paperwork",
          "delay",
          "packing list",
          "tariff"
        ]
      }
    ]
  },
  {
    "key": "rmg_compliance",
    "title": "RMG Apparel Export Manufacturing & Quality Compliance (ISO 9001)",
    "category": "Apparel & Textiles",
    "sections": [
      {
        "id": "sec_fabric_defects",
        "heading": "Section 2.4: Four-Point Fabric Inspection Defect Thresholds",
        "content": "All greige and dyed knit fabrics undergo four-point system quality inspection before automated laser cutting. Any fabric roll exhibiting greater than 28 penalty points per 100 square yards is classified as Grade B and is strictly prohibited from European Union (EU) and North American export shipments. Critical defects include drop stitches, elastane breakage, shade variation exceeding Delta E 0.8, and uncalibrated shrinkage exceeding 5% after 3 laundering cycles.",
        "keywords": [
          "fabric",
          "defect",
          "inspection",
          "four point",
          "quality",
          "grade b",
          "shrinkage",
          "shade"
        ]
      },
      {
        "id": "sec_buyer_lead_time",
        "heading": "Section 5.1: Export Delivery Timelines & Chargeback Penalties",
        "content": "Sample approval to production cut-off cycle is capped at 14 calendar days. Production lead times for standard circular knitwear orders (50,000 to 200,000 units) require delivery on board (FOB) within 45 days of Letter of Credit (L/C) opening. Shipping delays exceeding 7 calendar days incur an automatic 2% invoice discount per week up to a maximum 10% penalty, after which buyers reserve right of air-freight conversion at factory expense.",
        "keywords": [
          "lead time",
          "delivery",
          "penalty",
          "delay",
          "chargeback",
          "letter of credit",
          "fob",
          "buyer"
        ]
      }
    ]
  },
  {
    "key": "cloud_security",
    "title": "Zenthra Enterprise Cloud & Data Security Architecture (SOC2 / GDPR)",
    "category": "Enterprise IT Architecture",
    "sections": [
      {
        "id": "sec_encryption_standards",
        "heading": "Section 3.2: Cryptographic Standards & Field-Level Data Masking",
        "content": "All sensitive corporate databases, customer PII, and financial ledgers utilize AES-256 encryption at rest and TLS 1.3 in transit. Field-level data tokenization is enforced for corporate tax IDs, bank IBAN numbers, and medical record numbers (MRNs). Encryption keys are rotated automatically every 90 days via AWS KMS / Google Cloud KMS with hardware security module (HSM) backing.",
        "keywords": [
          "encryption",
          "security",
          "aes",
          "tls",
          "kms",
          "pii",
          "gdpr",
          "hipaa",
          "masking"
        ]
      }
    ]
  }
];