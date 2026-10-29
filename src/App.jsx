import React, { useEffect, useState } from "react";
import {
  Phone,
  ShieldCheck,
  Headphones,
  Send,
  UserCog,
} from "lucide-react";

import { supabase } from "./lib/supabase";
const fallbackScenarios = [
  {
    id: 1,
    title: "Maintenance Follow-up",
    subtitle: "Resident",
    checklistType: "maintenance",
    summary: "Following up on an unresolved maintenance request.",
    description:
      "A resident is following up because a previously reported maintenance concern has not been fully resolved. Practice acknowledging the impact, gathering the right details, and setting a clear next step.",
    caller: "Jordan M.",
    opening:
      "Hi, I'm following up on a maintenance request I reported earlier. The issue still isn't resolved and I'd really like to understand what's happening.",
  },
  {
    id: 2,
    title: "Prospect Inquiry",
    subtitle: "Prospect",
    Type: "prospect",
    summary: "Asking about available suites and rental options.",
    description:
      "A prospective resident is exploring rental options and wants help understanding availability, suite choices, and next steps.",
    caller: "Taylor R.",
    opening:
      "Hi, I'm looking for a new place and had a few questions about what's available and how I would get started.",
  },
  {
    id: 3,
    title: "Upset Resident",
    subtitle: "Resident",
    checklistType: "memo",
    summary: "Frustrated after previous attempts to resolve an issue.",
    description:
      "A frustrated resident is calling about a concern that has affected their experience. Practice de-escalation, active listening, ownership, and a calm path toward resolution.",
    caller: "Morgan S.",
    opening:
      "I'm pretty frustrated right now. I've already tried to get help with this and I don't feel like the problem has been taken care of.",
  },
  {
    id: 4,
    title: "Noise Complaint",
    subtitle: "Resident",
    checklistType: "memo",
    summary: "Reporting recurring noise affecting their home.",
    description:
      "A resident reports an ongoing noise concern involving a neighbouring suite. Practice gathering specific information without making assumptions or promising an outcome.",
    caller: "Alex P.",
    opening:
      "Hi, I'm hoping you can help me. There's been recurring noise near my suite and it's starting to become really disruptive.",
  },
  {
    id: 5,
    title: "Rent & Payment Question",
    subtitle: "Resident",
    checklistType: "memo",
    summary: "Needs help understanding a rent payment concern.",
    description:
      "A resident has questions about a rent payment and is unsure what to do next. Practice clarifying the concern and explaining available next steps.",
    caller: "Casey D.",
    opening:
      "Hi, I have a question about my rent payment and I'm not sure if everything went through correctly. Can you help me figure out what I should do?",
  },
  {
    id: 6,
    title: "Move-In Support",
    subtitle: "New Resident",
    checklistType: "maintenance",
    summary: "Has questions before their upcoming move-in.",
    description:
      "A new resident is preparing to move in and needs guidance. Practice creating a welcoming experience while answering questions and identifying anything needing follow-up.",
    caller: "Jamie L.",
    opening:
      "Hi! I'm moving in soon and I just wanted to make sure I understand what I need to know before move-in day.",
  },
  {
    id: 7,
    title: "Leasing & Application",
    subtitle: "Prospect",
    checklistType: "prospect",
    summary: "Needs guidance with the rental application process.",
    description:
      "A prospect is interested in applying but has questions about the rental process. Practice explaining the journey clearly and checking for understanding.",
    caller: "Sam K.",
    opening:
      "Hi, I found a place I'm interested in and I'd like to apply, but I have a couple of questions about the process first.",
  },
  {
    id: 8,
    title: "Escalated Service Concern",
    subtitle: "Resident",
    checklistType: "memo",
    summary: "Requesting escalation after an unresolved service concern.",
    description:
      "A resident believes previous attempts to resolve their concern have not worked and is asking for escalation. Practice empathy, ownership, documentation, and appropriate escalation language.",
    caller: "Riley T.",
    opening:
      "I've contacted someone about this before and I'm still dealing with the same problem. At this point I'd like this escalated to someone who can help.",
  },
];

export default function AICallSimulator() {
  const [scenarios, setScenarios] = useState(fallbackScenarios);
const [scenario, setScenario] = useState(fallbackScenarios[0]);
const [scenarioSource, setScenarioSource] = useState("fallback");
  const [databaseChecklists, setDatabaseChecklists] = useState({});
const [checklistSource, setChecklistSource] = useState("fallback");
  const [answered, setAnswered] = useState(false);
  const [completedScenarioIds, setCompletedScenarioIds] = useState([]);
  const [scenarioScores, setScenarioScores] = useState({});
  const [reply, setReply] = useState("");
  const [messages, setMessages] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [lastMessages, setLastMessages] = useState([]);

  const [trainerOpen, setTrainerOpen] = useState(false);
  const [trainerEmail, setTrainerEmail] = useState("");
  const [trainerPassword, setTrainerPassword] = useState("");
const [trainerAuthenticated, setTrainerAuthenticated] = useState(false);
  const [trainerTab, setTrainerTab] = useState("scenarios");
const [trainerLoginError, setTrainerLoginError] = useState("");
const [trainerLoggingIn, setTrainerLoggingIn] = useState(false);
  const [trainerScenarioForm, setTrainerScenarioForm] = useState({
  title: "",
  subtitle: "Resident",
  checklistType: "maintenance",
  summary: "",
  description: "",
  caller: "",
  opening: "",
});

const [trainerScenarioMessage, setTrainerScenarioMessage] = useState("");
const [trainerSavingScenario, setTrainerSavingScenario] = useState(false);
  
const [trainerScenarios, setTrainerScenarios] = useState([]);
const [trainerScenarioFilter, setTrainerScenarioFilter] = useState("all");
const [editingScenarioId, setEditingScenarioId] = useState(null);
  
  useEffect(() => {
  async function loadScenarios() {
    const { data, error } = await supabase
      .from("scenarios")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Unable to load scenarios from Supabase:", error);
      return;
    }

    if (!data || data.length === 0) {
      console.warn("No active Supabase scenarios found. Using fallback scenarios.");
      return;
    }

    const loadedScenarios = data.map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      checklistType: item.checklist_type,
      summary: item.summary,
      description: item.description,
      caller: item.caller,
      opening: item.opening,
    }));

    setScenarios(loadedScenarios);
    setScenario(loadedScenarios[0]);
    setScenarioSource("supabase");
  }

  loadScenarios();
}, []);

  useEffect(() => {
  async function loadChecklists() {
    const { data, error } = await supabase
      .from("checklist_items")
      .select("id, checklist_type, label, keywords, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error(
        "Unable to load checklists from Supabase:",
        error
      );
      return;
    }

    if (!data || data.length === 0) {
      console.warn(
        "No checklist items returned from Supabase. Using local fallback."
      );
      return;
    }

    const grouped = data.reduce((result, item) => {
      if (!result[item.checklist_type]) {
        result[item.checklist_type] = [];
      }

      result[item.checklist_type].push({
        id: item.id,
        label: item.label,
        keywords: item.keywords || [],
        sortOrder: item.sort_order,
      });

      return result;
    }, {});

    console.log(
      "Checklist data loaded from Supabase:",
      grouped
    );

    setDatabaseChecklists(grouped);
    setChecklistSource("supabase");
  }

  loadChecklists();
}, []);
  
  useEffect(() => {
  if (trainerAuthenticated) {
    loadTrainerScenarios();
  }
}, [trainerAuthenticated]);
  
const loadTrainerScenarios = async () => {
  const { data, error } = await supabase
    .from("scenarios")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error(
      "Unable to load trainer scenarios:",
      error
    );

    setTrainerScenarioMessage(
      "Unable to load scenarios for the Trainer Portal."
    );

    return;
  }

  console.log(
    "Trainer scenarios loaded:",
    data
  );

  setTrainerScenarios(data || []);
};
  const handleTrainerLogin = async (event) => {
  event.preventDefault();

  setTrainerLoginError("");
  setTrainerLoggingIn(true);

  const { error } = await supabase.auth.signInWithPassword({
    email: trainerEmail.trim(),
    password: trainerPassword,
  });

  if (error) {
    setTrainerLoginError("Incorrect email or password.");
    setTrainerLoggingIn(false);
    return;
  }

  setTrainerAuthenticated(true);
    await loadTrainerScenarios();
  setTrainerLoggingIn(false);
  setTrainerPassword("");
};
  const handleTrainerLogout = async () => {
  await supabase.auth.signOut();

  setTrainerAuthenticated(false);
  setTrainerOpen(false);
  setTrainerEmail("");
  setTrainerPassword("");
  setTrainerLoginError("");
};
  const handleCreateScenario = async (event) => {
  event.preventDefault();

  setTrainerScenarioMessage("");

  if (
    !trainerScenarioForm.title.trim() ||
    !trainerScenarioForm.summary.trim() ||
    !trainerScenarioForm.caller.trim() ||
    !trainerScenarioForm.opening.trim()
  ) {
    setTrainerScenarioMessage(
      "Please complete all required scenario fields."
    );
    return;
  }

  setTrainerSavingScenario(true);

  if (editingScenarioId) {
    const { data, error } = await supabase
      .from("scenarios")
      .update({
        title: trainerScenarioForm.title.trim(),
        subtitle: trainerScenarioForm.subtitle,
        checklist_type: trainerScenarioForm.checklistType,
        summary: trainerScenarioForm.summary.trim(),
        description:
          trainerScenarioForm.description.trim() ||
          trainerScenarioForm.summary.trim(),
        caller: trainerScenarioForm.caller.trim(),
        opening: trainerScenarioForm.opening.trim(),
      })
      .eq("id", editingScenarioId)
      .select()
      .single();

    if (error) {
      console.error(
        "Unable to update scenario:",
        error
      );

      setTrainerScenarioMessage(
        "The scenario could not be updated."
      );

      setTrainerSavingScenario(false);
      return;
    }

    const updatedScenario = {
      id: data.id,
      title: data.title,
      subtitle: data.subtitle,
      checklistType: data.checklist_type,
      summary: data.summary,
      description: data.description,
      caller: data.caller,
      opening: data.opening,
    };

    setScenarios((previous) =>
      previous.map((item) =>
        item.id === updatedScenario.id
          ? updatedScenario
          : item
      )
    );

    setEditingScenarioId(null);

    setTrainerScenarioForm({
      title: "",
      subtitle: "Resident",
      checklistType: "maintenance",
      summary: "",
      description: "",
      caller: "",
      opening: "",
    });

    await loadTrainerScenarios();

    setTrainerScenarioMessage(
      "Scenario updated successfully."
    );

    setTrainerSavingScenario(false);
    return;
  }

  const { data, error } = await supabase
    .from("scenarios")
    .insert({
      title: trainerScenarioForm.title.trim(),
      subtitle: trainerScenarioForm.subtitle,
      checklist_type: trainerScenarioForm.checklistType,
      summary: trainerScenarioForm.summary.trim(),
      description:
        trainerScenarioForm.description.trim() ||
        trainerScenarioForm.summary.trim(),
      caller: trainerScenarioForm.caller.trim(),
      opening: trainerScenarioForm.opening.trim(),
      is_active: true,
      sort_order: trainerScenarios.length + 1,
    })
    .select()
    .single();

  if (error) {
    console.error(
      "Unable to create scenario:",
      error
    );

    setTrainerScenarioMessage(
      "The scenario could not be created."
    );

    setTrainerSavingScenario(false);
    return;
  }

  const createdScenario = {
    id: data.id,
    title: data.title,
    subtitle: data.subtitle,
    checklistType: data.checklist_type,
    summary: data.summary,
    description: data.description,
    caller: data.caller,
    opening: data.opening,
  };

  setScenarios((previous) => [
    ...previous,
    createdScenario,
  ]);

  setTrainerScenarioForm({
    title: "",
    subtitle: "Resident",
    checklistType: "maintenance",
    summary: "",
    description: "",
    caller: "",
    opening: "",
  });

  await loadTrainerScenarios();

  setTrainerScenarioMessage(
    "Scenario created successfully."
  );

  setTrainerSavingScenario(false);
};

const handleToggleScenarioActive = async (item) => {
  setTrainerScenarioMessage("");

  const newStatus = !item.is_active;

  const { data, error } = await supabase
    .from("scenarios")
    .update({
      is_active: newStatus,
    })
    .eq("id", item.id)
    .select()
    .single();

  if (error) {
    console.error(
      "Unable to update scenario status:",
      error
    );

    setTrainerScenarioMessage(
      `Unable to ${
        newStatus ? "activate" : "deactivate"
      } "${item.title}".`
    );

    return;
  }

  await loadTrainerScenarios();

  if (newStatus) {
    const restoredScenario = {
      id: data.id,
      title: data.title,
      subtitle: data.subtitle,
      checklistType: data.checklist_type,
      summary: data.summary,
      description: data.description,
      caller: data.caller,
      opening: data.opening,
    };

    setScenarios((previous) => {
      const withoutScenario = previous.filter(
        (scenarioItem) =>
          scenarioItem.id !== restoredScenario.id
      );

      return [
        ...withoutScenario,
        restoredScenario,
      ];
    });
  } else {
    setScenarios((previous) =>
      previous.filter(
        (scenarioItem) =>
          scenarioItem.id !== item.id
      )
    );

    if (scenario.id === item.id) {
      const remainingScenarios =
        scenarios.filter(
          (scenarioItem) =>
            scenarioItem.id !== item.id
        );

      if (remainingScenarios.length > 0) {
        setScenario(remainingScenarios[0]);
      }
    }
  }

  setTrainerScenarioMessage(
    newStatus
      ? `"${item.title}" activated successfully.`
      : `"${item.title}" deactivated successfully.`
  );
};

   const handleEditScenario = (item) => {
  setEditingScenarioId(item.id);

  setTrainerScenarioForm({
    title: item.title || "",
    subtitle: item.subtitle || "Resident",
    checklistType: item.checklist_type || "maintenance",
    summary: item.summary || "",
    description: item.description || "",
    caller: item.caller || "",
    opening: item.opening || "",
  });

  setTrainerScenarioMessage(
    `Editing "${item.title}". Make your changes and select Save Changes.`
  );
};

    const handleDuplicateScenario = (item) => {
  setEditingScenarioId(null);

  setTrainerScenarioForm({
    title: `${item.title} - Copy`,
    subtitle: item.subtitle || "Resident",
    checklistType: item.checklist_type || "maintenance",
    summary: item.summary || "",
    description: item.description || "",
    caller: item.caller || "",
    opening: item.opening || "",
  });

  setTrainerScenarioMessage(
    "Scenario copied into the form. Make any changes, then select Create Scenario."
  );
};

    const handleDeleteScenario = async (item) => {
  const firstConfirmation = window.confirm(
    `Permanently delete "${item.title}"? This action cannot be undone.`
  );

  if (!firstConfirmation) {
    return;
  }

  const secondConfirmation = window.confirm(
    "Are you completely sure? Deactivating the scenario is recommended instead of permanent deletion."
  );

  if (!secondConfirmation) {
    return;
  }

  setTrainerScenarioMessage("");

  const { error } = await supabase
    .from("scenarios")
    .delete()
    .eq("id", item.id);

  if (error) {
    console.error("Unable to delete scenario:", error);

    setTrainerScenarioMessage(
      "The scenario could not be deleted."
    );

    return;
  }

  setScenarios((previous) =>
    previous.filter(
      (scenarioItem) => scenarioItem.id !== item.id
    )
  );

  setCompletedScenarioIds((previous) =>
    previous.filter(
      (scenarioId) => scenarioId !== item.id
    )
  );

  setScenarioScores((previous) => {
    const updatedScores = { ...previous };
    delete updatedScores[item.id];
    return updatedScores;
  });

  if (editingScenarioId === item.id) {
    setEditingScenarioId(null);

    setTrainerScenarioForm({
      title: "",
      subtitle: "Resident",
      checklistType: "maintenance",
      summary: "",
      description: "",
      caller: "",
      opening: "",
    });
  }

  await loadTrainerScenarios();

  setTrainerScenarioMessage(
    "Scenario permanently deleted."
  );
};

  const chooseScenario = (item) => {
    setScenario(item);
    setAnswered(false);
    setShowResults(false);
    setMessages([]);
    setLastMessages([]);
    setReply("");
  };

  const startCall = () => {
    setShowResults(false);
    setLastMessages([]);
    setMessages([]);
    setReply("");
    setAnswered(true);
  };

  const sendReply = () => {
    const value = reply.trim();

    if (!value) return;

    setMessages((previous) => [
      ...previous,
      {
        id: `${Date.now()}-${previous.length}`,
        text: value,
      },
    ]);

    setReply("");
  };

const endCall = () => {
  setLastMessages(messages);
  setAnswered(false);
  setShowResults(true);
  setReply("");

  setCompletedScenarioIds((previous) => {
    if (previous.includes(scenario.id)) {
      return previous;
    }

    return [...previous, scenario.id];
  });
};
const filteredTrainerScenarios = trainerScenarios.filter((item) => {
  if (trainerScenarioFilter === "inactive") {
    return !item.is_active;
  }

  if (trainerScenarioFilter === "all") {
    return true;
  }

  return item.checklist_type === trainerScenarioFilter;
});
  
const completedCount = completedScenarioIds.length;
const totalScenarioCount = scenarios.length;

const progressPercentage =
  totalScenarioCount > 0
    ? (completedCount / totalScenarioCount) * 100
    : 0;

  const transcript = lastMessages
    .map((message) => String(message.text || "").toLowerCase())
    .join(" ");

  const has = (...terms) =>
    terms.some((term) => transcript.includes(term));

  const maintenanceChecklist = [
    {
      label: "Branded in with Avenue Living",
      hit: has("avenue living") && lastMessages.length > 0,
    },
    {
      label: "Confirmed the caller's name",
      hit: has("name", "full name", "who am i speaking"),
    },
    {
      label: "Confirmed residency",
      hit: has(
        "resident",
        "residency",
        "live at",
        "living at",
        "leaseholder",
        "tenant"
      ),
    },
    {
      label: "Confirmed the resident's phone number",
      hit: has(
        "phone",
        "phone number",
        "contact number",
        "best number",
        "callback number"
      ),
    },
    {
      label: "Confirmed the resident's address",
      hit: has(
        "address",
        "property address",
        "unit number",
        "suite number",
        "building address"
      ),
    },
    {
      label: "Acknowledged the resident's concern",
      hit: has(
        "sorry",
        "understand",
        "appreciate",
        "concern",
        "frustrat"
      ),
    },
    {
      label: "Asked about damage or spread",
      hit: has("damage", "spread", "worse", "affected"),
    },
    {
      label: "Asked about access or pets",
      hit: has("pet", "dog", "cat", "access", "enter", "unit"),
    },
    {
      label: "Explained the next step or resolution",
      hit: has(
        "next step",
        "maintenance",
        "work order",
        "follow up",
        "send",
        "dispatch"
      ),
    },
    {
      label: "Branded out with Avenue Living",
      hit: has("avenue living") && lastMessages.length > 1,
    },
  ];

  const memoChecklist = [
    {
      label: "Branded in with Avenue Living",
      hit: has("avenue living") && lastMessages.length > 0,
    },
    {
      label: "Confirmed the caller's name",
      hit: has("name", "full name", "who am i speaking"),
    },
    {
      label: "Confirmed residency",
      hit: has(
        "resident",
        "residency",
        "live at",
        "living at",
        "leaseholder",
        "tenant"
      ),
    },
    {
      label: "Confirmed the resident's phone number",
      hit: has(
        "phone",
        "phone number",
        "contact number",
        "best number",
        "callback number"
      ),
    },
    {
      label: "Confirmed the resident's address",
      hit: has(
        "address",
        "property address",
        "unit number",
        "suite number",
        "building address"
      ),
    },
    {
      label: "Acknowledged the resident's concern",
      hit: has(
        "sorry",
        "understand",
        "appreciate",
        "concern",
        "frustrat"
      ),
    },
    {
      label: "Gathered the required memo details",
      hit: has(
        "details",
        "describe",
        "what happened",
        "incident",
        "memo",
        "document"
      ),
    },
    {
      label: "Confirmed the date or time of the concern",
      hit: has("date", "time", "when", "today", "yesterday"),
    },
    {
      label: "Confirmed the people or location involved",
      hit: has(
        "who",
        "person",
        "neighbour",
        "location",
        "where",
        "unit",
        "suite"
      ),
    },
    {
      label: "Explained the next step or follow-up",
      hit: has(
        "next step",
        "memo",
        "follow up",
        "follow-up",
        "review",
        "escalate",
        "submit"
      ),
    },
    {
      label: "Branded out with Avenue Living",
      hit: has("avenue living") && lastMessages.length > 1,
    },
  ];

  const prospectChecklist = [
    {
      label: "Branded in with Avenue Living",
      hit: has("avenue living") && lastMessages.length > 0,
    },
    {
      label: "Confirmed the prospect's name",
      hit: has("name", "full name", "who am i speaking"),
    },
    {
      label: "Confirmed the prospect's phone number",
      hit: has(
        "phone",
        "phone number",
        "contact number",
        "best number",
        "callback number"
      ),
    },
    {
      label: "Asked about preferred location",
      hit: has(
        "location",
        "area",
        "city",
        "neighbourhood",
        "community"
      ),
    },
    {
      label: "Asked about move-in timing",
      hit: has(
        "move in",
        "move-in",
        "moving",
        "when are you looking",
        "date"
      ),
    },
    {
      label: "Asked how many bedrooms",
      hit: has("how many bedrooms", "bedrooms", "bedroom"),
    },
    {
      label: "Asked how many occupants",
      hit: has(
        "how many occupants",
        "occupants",
        "people living",
        "how many people"
      ),
    },
    {
      label: "Asked if they had any pets",
      hit: has("pets", "pet", "dog", "cat"),
    },
    {
      label:
        "Asked if they can provide proof of gross income up to 2.5x the rental amount",
      hit: has(
        "proof of income",
        "gross income",
        "2.5x",
        "2.5 times",
        "two and a half times"
      ),
    },
    {
      label: "Asked if they are currently a resident",
      hit: has(
        "currently a resident",
        "current resident",
        "already a resident",
        "live with avenue living",
        "living with avenue living"
      ),
    },
    {
      label: "Asked how they heard about Avenue Living",
      hit: has(
        "how did you hear",
        "heard about avenue living",
        "hear about avenue living",
        "referred",
        "referral"
      ),
    },
    {
      label:
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

 const fallbackChecklist =
  scenario.checklistType === "maintenance"
    ? maintenanceChecklist
    : scenario.checklistType === "prospect"
    ? prospectChecklist
    : memoChecklist;

const databaseChecklist =
  databaseChecklists[scenario.checklistType] || [];

const checklist =
  checklistSource === "supabase" && databaseChecklist.length > 0
    ? databaseChecklist.map((item) => ({
        label: item.label,
        hit: (item.keywords || []).some((keyword) =>
          transcript.includes(String(keyword).toLowerCase())
        ),
      }))
    : fallbackChecklist;

const checklistScore = checklist.filter((item) => item.hit).length;
const checklistTotal = checklist.length;

  const saveBestScore = () => {
  setScenarioScores((previous) => {
    const existing = previous[scenario.id];

    if (!existing || checklistScore > existing.score) {
      return {
        ...previous,
        [scenario.id]: {
          score: checklistScore,
          total: checklistTotal,
        },
      };
    }

    return previous;
  });
};
  checklistSource === "supabase" && databaseChecklist.length > 0
    ? databaseChecklist.map((item) => ({
        label: item.label,
        hit: (item.keywords || []).some((keyword) =>
          transcript.includes(String(keyword).toLowerCase())
        ),
      }))
    : fallbackChecklist;

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
            <div className="flex h-8 items-center rounded-md border border-[#90b2a4] bg-[#e1eee7] px-2.5 text-xs font-medium text-[#285c4b]">
              <ShieldCheck size={13} className="mr-1" />
              Training only
            </div>

            <button
              onClick={() => setTrainerOpen((value) => !value)}
              className="flex h-8 items-center rounded-lg border-2 border-[#2f6655] bg-white px-3 text-xs font-semibold text-[#285c4b] shadow-sm hover:bg-[#e7f1eb]"
            >
              <UserCog size={15} className="mr-1.5" />
              Trainer
            </button>
          </div>
        </div>
      </header>

    {trainerOpen && (
  <main className="mx-auto flex max-w-[1400px] justify-center px-4 py-4">
    {!trainerAuthenticated ? (
      <div className="w-full max-w-md rounded-2xl border-2 border-[#3b735d] bg-[#fbfcf9] p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-[#2f6655] p-2 text-white">
            <UserCog size={20} />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#234b40]">
              Trainer Login
            </h2>

            <p className="text-xs text-[#667d73]">
              Sign in to access trainer tools.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleTrainerLogin}
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#315f54]">
              Email
            </label>

            <input
              type="email"
              value={trainerEmail}
              onChange={(event) => {
                setTrainerEmail(event.target.value);
                setTrainerLoginError("");
              }}
              placeholder="Trainer email"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-[#b7ccc1] bg-white px-3 py-2.5 text-sm text-[#285c4b] outline-none placeholder:text-[#759085] focus:border-[#3b735d]"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-[#315f54]">
              Password
            </label>

            <input
              type="password"
              value={trainerPassword}
              onChange={(event) => {
                setTrainerPassword(event.target.value);
                setTrainerLoginError("");
              }}
              placeholder="Password"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-[#b7ccc1] bg-white px-3 py-2.5 text-sm text-[#285c4b] outline-none placeholder:text-[#759085] focus:border-[#3b735d]"
            />
          </div>

          {trainerLoginError && (
            <div className="rounded-lg border border-[#d9b1aa] bg-[#f8ece9] px-3 py-2 text-xs font-medium text-[#875146]">
              {trainerLoginError}
            </div>
          )}

          <button
            type="submit"
            disabled={trainerLoggingIn}
            className="w-full rounded-lg bg-[#326b55] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#285b48] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {editingScenarioId && (
  <button
    type="button"
    onClick={() => {
      setEditingScenarioId(null);

      setTrainerScenarioForm({
        title: "",
        subtitle: "Resident",
        checklistType: "maintenance",
        summary: "",
        description: "",
        caller: "",
        opening: "",
      });

      setTrainerScenarioMessage("");
    }}
    className="w-full rounded-lg border-2 border-[#3b735d] bg-white px-4 py-2 text-sm font-semibold text-[#285c4b]"
  >
    Cancel editing
  </button>
)}
            
            {trainerLoggingIn ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setTrainerOpen(false);
            setTrainerLoginError("");
            setTrainerPassword("");
          }}
          className="mt-3 w-full rounded-lg border-2 border-[#3b735d] bg-white px-4 py-2 text-sm font-semibold text-[#285c4b] hover:bg-[#e7f1eb]"
        >
          Back to simulator
        </button>
      </div>
    ) : (
      <div className="w-full max-w-4xl rounded-2xl border-2 border-[#3b735d] bg-[#fbfcf9] p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex rounded-full bg-[#e1eee7] px-3 py-1 text-xs font-semibold text-[#285c4b]">
              Authenticated trainer
            </div>

            <h2 className="text-2xl font-semibold text-[#234b40]">
              Trainer Portal
            </h2>

            <p className="mt-1 text-sm text-[#667d73]">
              Trainer access authenticated successfully.
            </p>

            <p className="mt-2 text-xs font-medium text-[#557469]">
              Signed in as {trainerEmail}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
  <div className="rounded-xl border border-[#b7ccc1] bg-white p-3">
    <div className="text-2xl font-semibold text-[#285749]">
      {trainerScenarios.length}
    </div>
    <div className="mt-1 text-xs font-medium text-[#667d73]">
      Total Scenarios
    </div>
  </div>

  <div className="rounded-xl border border-[#b7ccc1] bg-white p-3">
    <div className="text-2xl font-semibold text-[#285749]">
      {trainerScenarios.filter(
        (item) => item.checklist_type === "maintenance"
      ).length}
    </div>
    <div className="mt-1 text-xs font-medium text-[#667d73]">
      Maintenance
    </div>
  </div>

  <div className="rounded-xl border border-[#b7ccc1] bg-white p-3">
    <div className="text-2xl font-semibold text-[#285749]">
      {trainerScenarios.filter(
        (item) => item.checklist_type === "memo"
      ).length}
    </div>
    <div className="mt-1 text-xs font-medium text-[#667d73]">
      Memo Required
    </div>
  </div>

  <div className="rounded-xl border border-[#b7ccc1] bg-white p-3">
    <div className="text-2xl font-semibold text-[#285749]">
      {trainerScenarios.filter(
        (item) => item.checklist_type === "prospect"
      ).length}
    </div>
    <div className="mt-1 text-xs font-medium text-[#667d73]">
      Prospect
    </div>
  </div>
</div>
          </div>

          <button
            type="button"
            onClick={handleTrainerLogout}
            className="rounded-lg border-2 border-[#3b735d] bg-white px-4 py-2 text-sm font-semibold text-[#285c4b] hover:bg-[#e7f1eb]"
          >
            Sign out
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 border-b border-[#c7d8cf] pb-3">
  <button
    type="button"
    onClick={() => setTrainerTab("scenarios")}
    className={`rounded-lg px-4 py-2 text-sm font-semibold ${
      trainerTab === "scenarios"
        ? "bg-[#326653] text-white"
        : "border border-[#b7ccc1] bg-white text-[#326653] hover:bg-[#edf4ef]"
    }`}
  >
    Scenario Manager
  </button>

  <button
    type="button"
    onClick={() => setTrainerTab("checklists")}
    className={`rounded-lg px-4 py-2 text-sm font-semibold ${
      trainerTab === "checklists"
        ? "bg-[#326653] text-white"
        : "border border-[#b7ccc1] bg-white text-[#326653] hover:bg-[#edf4ef]"
    }`}
  >
    Checklist Editor
  </button>

  <button
    type="button"
    onClick={() => setTrainerTab("results")}
    className={`rounded-lg px-4 py-2 text-sm font-semibold ${
      trainerTab === "results"
        ? "bg-[#326653] text-white"
        : "border border-[#b7ccc1] bg-white text-[#326653] hover:bg-[#edf4ef]"
    }`}
  >
    Employee Results
  </button>
</div>

        {trainerTab === "scenarios" && (
        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
  <div className="rounded-xl border border-[#c7d8cf] bg-[#f3f7f4] p-4">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-base font-semibold text-[#285749]">
          Scenarios
        </h3>

        <div className="mt-3 flex flex-wrap gap-2">
  {[
    ["all", "All"],
    ["maintenance", "Maintenance"],
    ["memo", "Memo Required"],
    ["prospect", "Prospect"],
    ["inactive", "Inactive"],
  ].map(([value, label]) => (
    <button
      key={value}
      type="button"
      onClick={() => setTrainerScenarioFilter(value)}
      className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
        trainerScenarioFilter === value
          ? "border-[#326653] bg-[#326653] text-white"
          : "border-[#b7ccc1] bg-white text-[#326653]"
      }`}
    >
      {label}
    </button>
  ))}
</div>

        <p className="mt-1 text-xs text-[#667d73]">
{trainerScenarios.length} scenarios available
        </p>
      </div>
    </div>

    <div className="mt-4 max-h-[520px] space-y-2 overflow-y-auto pr-1">
      {filteredTrainerScenarios.map((item) => (
        <div
          key={item.id}
          className="rounded-lg border border-[#c7d8cf] bg-white p-3"
        >
          <div className="text-sm font-semibold text-[#285749]">
            {item.title}
          </div>

          <div className="mt-1 text-xs font-medium text-[#5c7c6e]">
            {item.subtitle}
          </div>

          <div className="mt-1 text-[11px] text-[#6b8178]">
            Checklist: {item.checklistType}
          </div>

          <p className="mt-2 text-xs leading-5 text-[#667d73]">
            {item.summary}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <div
  className={`mt-2 text-[10px] font-semibold ${
    item.is_active
      ? "text-[#326653]"
      : "text-[#8b6147]"
  }`}
>
  {item.is_active ? "Active" : "Inactive"}
</div>

            <button
  type="button"
  onClick={() => handleEditScenario(item)}
  className="rounded-lg border border-[#9bb7ab] bg-[#edf4ef] px-2.5 py-1.5 text-[11px] font-semibold text-[#285c4b]"
>
  Edit
</button>

            <button
  type="button"
  onClick={() => handleDuplicateScenario(item)}
  className="rounded-lg border border-[#b7ccc1] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#326653] hover:bg-[#edf4ef]"
>
  Duplicate
</button>
            
  <button
    type="button"
    onClick={() => handleToggleScenarioActive(item)}
    className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold ${
      item.is_active
        ? "border-[#d4b69f] bg-[#fbf3ec] text-[#8b6147]"
        : "border-[#9bc0ac] bg-[#e7f2eb] text-[#285c4b]"
    }`}
  >
    {item.is_active ? "Deactivate" : "Activate"}
  </button>
            {!item.is_active && (
  <button
    type="button"
    onClick={() => handleDeleteScenario(item)}
    className="rounded-lg border border-[#d9aaa0] bg-[#fbefed] px-2.5 py-1.5 text-[11px] font-semibold text-[#9a5145] hover:bg-[#f6dfdb]"
  >
    Delete
  </button>
)}
</div>
        </div>
      ))}
    </div>
  </div>

  <div className="rounded-xl border-2 border-[#3b735d] bg-white p-4">
    <h3 className="text-base font-semibold text-[#285749]">
      {editingScenarioId ? "Edit Scenario" : "Add Scenario"}
    </h3>

    <p className="mt-1 text-xs text-[#667d73]">
      Create a new trainee practice scenario.
    </p>

    <form
      onSubmit={handleCreateScenario}
      className="mt-4 space-y-3"
    >
      <div>
        <label className="mb-1 block text-xs font-semibold text-[#315f54]">
          Scenario title *
        </label>

        <input
          value={trainerScenarioForm.title}
          onChange={(event) =>
            setTrainerScenarioForm({
              ...trainerScenarioForm,
              title: event.target.value,
            })
          }
          placeholder="Example: Heating Concern"
          className="w-full rounded-lg border border-[#b7ccc1] px-3 py-2 text-sm text-[#285c4b] outline-none focus:border-[#3b735d]"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-[#315f54]">
            Caller type
          </label>

          <select
            value={trainerScenarioForm.subtitle}
            onChange={(event) =>
              setTrainerScenarioForm({
                ...trainerScenarioForm,
                subtitle: event.target.value,
              })
            }
            className="w-full rounded-lg border border-[#b7ccc1] bg-white px-3 py-2 text-sm text-[#285c4b]"
          >
            <option value="Resident">Resident</option>
            <option value="New Resident">
              New Resident
            </option>
            <option value="Prospect">Prospect</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-[#315f54]">
            Checklist
          </label>

          <select
            value={trainerScenarioForm.checklistType}
            onChange={(event) =>
              setTrainerScenarioForm({
                ...trainerScenarioForm,
                checklistType: event.target.value,
              })
            }
            className="w-full rounded-lg border border-[#b7ccc1] bg-white px-3 py-2 text-sm text-[#285c4b]"
          >
            <option value="maintenance">
              Resident - Maintenance
            </option>

            <option value="memo">
              Resident - Memo required
            </option>

            <option value="prospect">
              Prospect
            </option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-[#315f54]">
          Short summary *
        </label>

        <input
          value={trainerScenarioForm.summary}
          onChange={(event) =>
            setTrainerScenarioForm({
              ...trainerScenarioForm,
              summary: event.target.value,
            })
          }
          placeholder="5-10 word reason for the call"
          className="w-full rounded-lg border border-[#b7ccc1] px-3 py-2 text-sm text-[#285c4b] outline-none focus:border-[#3b735d]"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-[#315f54]">
          Trainee briefing
        </label>

        <textarea
          value={trainerScenarioForm.description}
          onChange={(event) =>
            setTrainerScenarioForm({
              ...trainerScenarioForm,
              description: event.target.value,
            })
          }
          placeholder="Describe the situation shown before the call starts."
          className="min-h-[80px] w-full resize-none rounded-lg border border-[#b7ccc1] px-3 py-2 text-sm text-[#285c4b] outline-none focus:border-[#3b735d]"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-[#315f54]">
          Fictional caller name *
        </label>

        <input
          value={trainerScenarioForm.caller}
          onChange={(event) =>
            setTrainerScenarioForm({
              ...trainerScenarioForm,
              caller: event.target.value,
            })
          }
          placeholder="Example: Jordan M."
          className="w-full rounded-lg border border-[#b7ccc1] px-3 py-2 text-sm text-[#285c4b] outline-none focus:border-[#3b735d]"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-[#315f54]">
          Caller opening statement *
        </label>

        <textarea
          value={trainerScenarioForm.opening}
          onChange={(event) =>
            setTrainerScenarioForm({
              ...trainerScenarioForm,
              opening: event.target.value,
            })
          }
          placeholder="Enter what the caller says when the interaction begins."
          className="min-h-[90px] w-full resize-none rounded-lg border border-[#b7ccc1] px-3 py-2 text-sm text-[#285c4b] outline-none focus:border-[#3b735d]"
        />
      </div>

      {trainerScenarioMessage && (
        <div className="rounded-lg bg-[#edf4ef] px-3 py-2 text-xs font-semibold text-[#326653]">
          {trainerScenarioMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={trainerSavingScenario}
        className="w-full rounded-lg bg-[#326b55] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#285b48] disabled:opacity-50"
      >
        {trainerSavingScenario
  ? "Saving..."
  : editingScenarioId
  ? "Save Changes"
  : "Create Scenario"}
      </button>
    </form>
  </div>
</div>
        )}

        {trainerTab === "checklists" && (
  <div className="mt-6 rounded-xl border-2 border-[#3b735d] bg-white p-5">
    <h3 className="text-lg font-semibold text-[#285749]">
      Checklist Editor
    </h3>

    <p className="mt-1 text-sm text-[#667d73]">
      Manage Maintenance, Memo Required, and Prospect checklist criteria.
    </p>

    <div className="mt-5 rounded-lg border border-[#c7d8cf] bg-[#f3f7f4] p-4">
      <p className="text-sm font-semibold text-[#326653]">
        Checklist management controls will be added here next.
      </p>
    </div>
  </div>
)}

        {trainerTab === "results" && (
  <div className="mt-6 rounded-xl border-2 border-[#3b735d] bg-white p-5">
    <h3 className="text-lg font-semibold text-[#285749]">
      Employee Results
    </h3>

    <p className="mt-1 text-sm text-[#667d73]">
      Review trainee attempts, scenario scores, and completed checklist criteria.
    </p>

    <div className="mt-5 rounded-lg border border-[#c7d8cf] bg-[#f3f7f4] p-4">
      <p className="text-sm font-semibold text-[#326653]">
        Employee training results will be displayed here.
      </p>
    </div>
  </div>
)}

        <button
          type="button"
          onClick={() => setTrainerOpen(false)}
          className="mt-4 rounded-lg bg-[#326b55] px-4 py-2 text-sm font-semibold text-white hover:bg-[#285b48]"
        >
          Return to simulator
        </button>
      </div>
    )}
  </main>
)}

      <main
        className={
          trainerOpen
            ? "hidden"
            : "mx-auto max-w-[1400px] px-2 py-2"
        }
      >
        <div
          className="flex items-start gap-3"
          style={{ flexWrap: "nowrap" }}
        >
          <aside className="w-[280px] min-w-[280px] max-w-[280px]">
            <div className="rounded-xl border-2 border-[#3b735d] bg-[#fbfcf9] p-2 shadow-sm">
              <div className="rounded-lg bg-[#f3f7f4] px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-[#285749]">
                      Training progress
                    </div>
                    <div className="text-[10px] text-[#6b8178]">
                      Complete practice calls to build confidence.
                    </div>
                  </div>

                  <span className="rounded-full border border-[#b9d0c4] bg-white px-2 py-0.5 text-[11px] font-semibold text-[#326452]">
                    {completedCount}/{totalScenarioCount}
                  </span>
                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e5ece8]">
                  <div
                    className="h-full rounded-full bg-[#3b735d] transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="flex items-end justify-between px-1 pb-2 pt-2">
  <div>
    <div className="text-sm font-semibold text-[#285749]">
      Choose Scenario
    </div>

    <div className="text-[10px] text-[#6b8178]">
      Select a conversation to practice
    </div>
  </div>

  <div className="text-right">
    <div className="text-[10px] font-semibold text-[#5c7c6e]">
      {scenarios.length} available
    </div>

    <div className="text-[9px] font-semibold text-[#326653]">
      {scenarioSource === "supabase"
        ? "Database connected"
        : "Local fallback"}
    </div>

    <div className="text-[9px] font-semibold text-[#326653]">
  {checklistSource === "supabase"
    ? `Checklists connected (${
        Object.values(databaseChecklists).flat().length
      })`
    : "Checklist fallback"}
</div>
  </div>
</div>
              <div className="max-h-[455px] space-y-1.5 overflow-y-auto pr-1">
                {scenarios.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => chooseScenario(item)}
                    className={`w-full rounded-lg border px-3 py-2.5 text-left transition ${
                      scenario.id === item.id
                        ? "border-[#4f806c] bg-[#deebe4]"
                        : "border-[#d4dfd8] bg-white hover:bg-[#edf4ef]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
  <div className="flex items-center justify-between gap-2">
  <div className="text-xs font-semibold text-[#285749]">
    {item.title}
  </div>

  {completedScenarioIds.includes(item.id) && (
    <span className="whitespace-nowrap rounded-full bg-[#39705a] px-2 py-0.5 text-[9px] font-semibold text-white">
      Completed
    </span>
  )}
</div>

  {completedScenarioIds.includes(item.id) && (
    <span className="rounded-full bg-[#39705a] px-2 py-0.5 text-[9px] font-semibold text-white">
      Completed
    </span>
  )}
</div>
                    <div className="mt-0.5 text-[11px] font-medium text-[#5c7c6e]">
                      {item.subtitle}
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-[#697a73]">
                      {item.summary}
                    </p>

                    {scenarioScores[item.id] && (
  <div className="mt-1 text-[10px] font-semibold text-[#326653]">
    Best: {scenarioScores[item.id].score}/{scenarioScores[item.id].total}
  </div>
)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-[#a9c7b8] bg-[#dfece5] p-3 shadow-sm">
              <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-[#285c4b]">
                <ShieldCheck size={15} />
                Training safeguards
              </div>

              <ul className="space-y-1 text-[11px] leading-4 text-[#48685c]">
                <li>• Fictional training scenarios</li>
                <li>• No production resident data</li>
                <li>• Coaching-focused practice</li>
              </ul>
            </div>
          </aside>

          <section className="min-w-0 flex-1">
            <div className="w-full overflow-hidden rounded-xl border-2 border-[#3b735d] bg-[#fbfcf9] shadow-sm">
              {showResults && !answered ? (
                <div className="p-5">
                  <span className="inline-flex rounded-md bg-[#39705a] px-2.5 py-1 text-xs font-medium text-white">
                    Call complete
                  </span>

<h2 className="mt-2 text-2xl font-semibold text-[#234b40]">
  Interaction checklist
</h2>

<div className="mt-2 inline-flex items-center rounded-full border border-[#9bc0ac] bg-[#e7f2eb] px-3 py-1.5 text-sm font-semibold text-[#285c4b]">
  Score: {checklistScore}/{checklistTotal}
</div>

                  <div className="mt-2 text-xs font-medium text-[#5c746a]">
  {checklistScore} criteria completed · {checklistTotal - checklistScore} opportunities
</div>

                  <p className="mt-3 text-sm text-[#657a71]">
                    Criteria detected from your responses during this
                    practice call.
                  </p>

                  <div className="mt-4 grid gap-2 md:grid-cols-2">
                    {checklist.map((item) => (
                      <div
                        key={item.label}
                        className={`flex items-center gap-2 rounded-lg border p-3 ${
                          item.hit
                            ? "border-[#9bc0ac] bg-[#e7f2eb]"
                            : "border-[#e1d1b9] bg-[#faf5ec]"
                        }`}
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            item.hit
                              ? "bg-[#39705a] text-white"
                              : "bg-[#e8dcc8] text-[#7a684f]"
                          }`}
                        >
                          {item.hit ? "✓" : "○"}
                        </span>

                        <span
                          className={`text-xs font-semibold ${
                            item.hit
                              ? "text-[#285c4b]"
                              : "text-[#5f5543]"
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                   onClick={() => {
  saveBestScore();
  setShowResults(false);
  setLastMessages([]);
  setMessages([]);
}}
                    className="mt-4 rounded-lg bg-[#326b55] px-4 py-2 text-sm font-semibold text-white hover:bg-[#285b48]"
                  >
                    Return to scenarios
                  </button>
                  <button
  onClick={() => {
    saveBestScore();
    setShowResults(false);
    setLastMessages([]);
    setMessages([]);
    setReply("");
    setAnswered(true);
  }}
  className="ml-2 rounded-lg border-2 border-[#3b735d] bg-white px-4 py-2 text-sm font-semibold text-[#285c4b] hover:bg-[#e7f1eb]"
>
  Retry scenario
</button>
                </div>
              ) : !answered ? (
                <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
                  <span className="rounded-md bg-[#39705a] px-2.5 py-1 text-xs font-medium text-white">
                    Selected scenario
                  </span>

                  <h2 className="mt-3 text-3xl font-semibold text-[#234b40]">
                    {scenario.title}
                  </h2>

                  <div className="mt-2 rounded-full bg-[#e6f0ea] px-3 py-1.5 text-xs font-semibold text-[#326653]">
                    {scenario.subtitle}
                  </div>

                  <p className="mt-4 max-w-2xl text-sm leading-6 text-[#657a71]">
                    {scenario.description}
                  </p>

                  <button
                    onClick={startCall}
                    className="mt-5 flex h-10 items-center rounded-lg bg-[#326b55] px-6 text-sm font-semibold text-white hover:bg-[#285b48]"
                  >
                    <Phone size={16} className="mr-2" />
                    Start call
                  </button>
                </div>
              ) : (
                <div className="p-4">
                  <div className="flex items-start justify-between border-b border-[#ccdad2] pb-3">
                    <div>
                      <span className="rounded-md bg-[#39705a] px-2.5 py-1 text-xs font-medium text-white">
                        Call in progress
                      </span>

                      <div className="mt-2 flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-[#234b40]">
                          {scenario.caller}
                        </h2>

                        <span className="text-[#9aaca3]">•</span>

                        <span className="rounded-full bg-[#e6f0ea] px-2.5 py-1 text-xs font-semibold text-[#326653]">
                          {scenario.title}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-[#62776e]">
                        {scenario.subtitle}
                      </p>
                    </div>

                    <button
                      className="rounded-lg bg-[#b26752] px-3 py-2 text-xs font-semibold text-white hover:bg-[#9d5947]"
                      onClick={endCall}
                    >
                      End practice call
                    </button>
                  </div>

                  <div className="mt-3 space-y-3">
                    <div className="max-w-2xl rounded-xl border border-[#d4e0d9] bg-[#edf3ef] p-3">
                      <p className="text-xs font-semibold text-[#285c4b]">
                        {scenario.caller}
                      </p>
                      <p className="mt-1 text-sm leading-5 text-[#315f54]">
                        {scenario.opening}
                      </p>
                    </div>

                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className="ml-auto max-w-2xl rounded-xl bg-[#326b55] p-3 text-white"
                      >
                        <p className="text-xs font-semibold text-[#dcebe4]">
                          You
                        </p>
                        <p className="mt-1 text-sm leading-5">
                          {message.text}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 border-t border-[#ccdad2] pt-3">
                    <div className="mb-1.5 text-xs font-medium text-[#3d6355]">
                      Your response
                    </div>

                    <div className="flex gap-2">
                      <textarea
                        value={reply}
                        onChange={(event) =>
                          setReply(event.target.value)
                        }
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" &&
                            !event.shiftKey
                          ) {
                            event.preventDefault();
                            sendReply();
                          }
                        }}
                        placeholder={`Respond to ${scenario.caller}...`}
                        className="min-h-[72px] flex-1 resize-none rounded-lg border border-[#b7ccc1] bg-white p-3 text-sm text-[#285c4b] caret-[#285c4b] outline-none placeholder:text-[#6f8b80] focus:border-[#4f806c]"
                      />

                      <button
                        onClick={sendReply}
                        disabled={!reply.trim()}
                        className="flex h-[72px] w-[64px] items-center justify-center rounded-lg bg-[#326b55] text-white hover:bg-[#285b48] disabled:opacity-40"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
