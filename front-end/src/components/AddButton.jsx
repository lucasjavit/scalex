const AddButton = ({ onClick, label, icon = '+' }) => {
  return (
    <button
      onClick={onClick}
      className="group inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-700 dark:to-emerald-800 text-emerald-800 dark:text-emerald-100 shadow-lg border border-emerald-300 dark:border-emerald-600 hover:shadow-xl hover:from-emerald-200 hover:to-emerald-300 dark:hover:from-emerald-600 dark:hover:to-emerald-700 active:shadow-inner active:translate-y-0.5 transition-all duration-200"
    >
      <span className="text-xl font-bold">{icon}</span>
      <span className="font-semibold">{label}</span>
    </button>
  );
};

export default AddButton;

