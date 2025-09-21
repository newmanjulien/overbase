"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { RowCard } from "@/components/RowCard";
import { InfoCard } from "@/components/InfoCard";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";

interface Customer {
  id: string;
  name: string;
  company: string;
}

const mockCustomers: Customer[] = [
  { id: "101", name: "Emily Carter", company: "Acme Corp" },
  { id: "102", name: "David Lee", company: "Globex Inc" },
  { id: "103", name: "Olivia Martinez", company: "Initech" },
];

function CustomersLayout() {
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const router = useRouter();

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    const isChecked = checked === true;
    setSelectAll(isChecked);
    if (isChecked) {
      setSelectedCustomers(mockCustomers.map((c) => c.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleSelectCustomer = (customerId: string, checked: boolean) => {
    if (checked) {
      setSelectedCustomers((prev) => [...prev, customerId]);
    } else {
      setSelectedCustomers((prev) => prev.filter((id) => id !== customerId));
      setSelectAll(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Customers"
        subtitle="Add customers who you want us to consult while collecting data for you or who you want us to send data to."
        buttonLabel="Add customer"
        onButtonClick={() => {}}
        buttonVariant="default"
        learnMoreLink="#"
      />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="w-full flex flex-col gap-3">
          {/* Select All row (compact automatically, no showAvatar) */}
          <RowCard
            title="Select all"
            titleClassName="text-gray-500 font-normal"
            leading={
              <Checkbox
                checked={selectAll}
                onCheckedChange={handleSelectAll}
                className="w-4 h-4 border-gray-300 data-[state=checked]:bg-gray-800 data-[state=checked]:border-gray-800 rounded-sm"
              />
            }
            menuItems={[
              {
                label: "Delete",
                onClick: () => console.log("Delete all selected"),
                destructive: true,
              },
            ]}
          />

          {/* Customer rows (normal height, showAvatar true) */}
          {mockCustomers.map((customer) => (
            <RowCard
              key={customer.id}
              title={customer.name}
              subtitle={customer.company}
              image="" // empty → fallback letter
              showAvatar
              leading={
                <Checkbox
                  checked={selectedCustomers.includes(customer.id)}
                  onCheckedChange={(checked) =>
                    handleSelectCustomer(customer.id, checked as boolean)
                  }
                  className="w-4 h-4 border-gray-300 data-[state=checked]:bg-gray-800 data-[state=checked]:border-gray-800 rounded-sm"
                />
              }
              menuItems={[
                {
                  label: "Edit",
                  onClick: () => console.log("Edit", customer.id),
                },
                {
                  label: "Delete",
                  onClick: () => console.log("Delete", customer.id),
                  destructive: true,
                },
              ]}
            />
          ))}
        </div>

        {/* InfoCard at the bottom */}
        <div className="mt-8 w-full">
          <InfoCard
            text="We can contact customers on your behalf when we're collecting data for your requests"
            linkText="Request data"
            onClick={() => router.push("/dashboard/requests")}
          />
        </div>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  return <CustomersLayout />;
}
