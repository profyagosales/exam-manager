import { motion } from "framer-motion";

interface Step {
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    title: "Design exam templates",
    description: "Create templates for exams with dynamic placeholders.",
  },
  {
    title: "Integrate analytics",
    description: "Visualize students’ performance across exams.",
  },
  {
    title: "Collaborative editing",
    description: "Allow multiple instructors to edit exam content in real-time.",
  },
];

export default function NextStepsPage() {
  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-center"
      >
        Next Steps
      </motion.h1>
      <ul className="space-y-4">
        {steps.map((step, index) => (
          <motion.li
            key={step.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-md border bg-white shadow-sm"
          >
            <h2 className="text-xl font-semibold">{step.title}</h2>
            <p className="text-gray-600">{step.description}</p>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

