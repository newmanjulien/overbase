import StaticAnswer from "@/components/blocks/StaticAnswer";
import StaticHeader from "@/components/blocks/StaticHeader";
import StaticFooter from "@/components/blocks/StaticFooter";

export default function ExamplePage() {
  return (
    <div className="flex min-h-screen flex-col bg-muted">
      <StaticHeader />
      <main className="pt-14 flex-grow">
        <StaticAnswer />
      </main>
      <StaticFooter />
    </div>
  );
}
