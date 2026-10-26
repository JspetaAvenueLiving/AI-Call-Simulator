        "Asked them to bring 1 piece of ID and proof of income to the showing",
      hit: has(
        "piece of id",
        "photo id",
        "identification",
        "proof of income",
        "bring id",
        "bring identification"
      ),
    },
    {
      label: "Asked about budget",
      hit: has(
        "budget",
        "price range",
        "rent range",
        "monthly"
      ),
    },
    {
      label: "Explained availability or next steps",
      hit: has(
        "available",
        "availability",
        "application",
        "viewing",
        "tour",
        "next step",
        "follow up"
      ),
    },
    {
      label: "Checked for additional questions",
      hit: has(
        "other questions",
        "anything else",
        "additional questions",
        "else can i help"
      ),
    },
    {
      label: "Branded out with Avenue Living",
      hit: has("avenue living") && lastMessages.length > 1,
    },
  ];

  const checklist =
    scenario.checklistType === "maintenance"
      ? maintenanceChecklist
      : scenario.checklistType === "prospect"
      ? prospectChecklist
      : memoChecklist;

  return (
    <div className="min-h-screen bg-[#eef3ed] text-[#29443c]">
      <header className="rounded-b-xl border-2 border-[#3b735d] bg-[#f9fbf7] px-5 py-3 shadow-sm">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#2f6655] p-2 text-white">
              <Headphones size={20} />
            </div>

            <div>
              <h1 className="text-lg font-semibold leading-tight text-[#234b40]">
                AI Call Simulator
              </h1>
              <p className="text-xs text-[#557469]">
                Customer Experience Practice Environment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-8 items-
