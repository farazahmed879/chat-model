import Chatbot from "@/components/Chatbot";

function App() {
  return (
    <div className="flex flex-col min-h-full w-full max-w-3xl mx-auto px-4">
      <header
        className="sticky top-0 shrink-0 z-20 bg-white border-b shadow-md"
        style={{
          borderBottom: "1px solid #ddd",
          boxShadow: "0px 4px 4px -2px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="flex flex-col h-full w-full gap-1 pt-4 pb-2">
          <h1 className="font-urbanist text-[1.65rem] font-semibold">
            Local Demo AI
          </h1>
        </div>
      </header>
      <Chatbot />
    </div>
  );
}

export default App;
