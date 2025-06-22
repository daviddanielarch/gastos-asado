"use client";

import { useState, useEffect } from "react";

export default function PartySplitApp() {
  const [people, setPeople] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("partyPeople");
      return saved ? JSON.parse(saved) : [{ name: "", spent: 0, alias: "", enabled: true }];
    }
    return [{ name: "", spent: 0, alias: "", enabled: true }];
  });
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("partyPeople", JSON.stringify(people));
    }
  }, [people]);

  const handleChange = (index, field, value) => {
    const newPeople = [...people];
    newPeople[index][field] = field === "spent" ? Number(value) : value;
    setPeople(newPeople);
  };

  const handleToggle = (index) => {
    const newPeople = [...people];
    newPeople[index].enabled = !newPeople[index].enabled;
    setPeople(newPeople);
  };

  const deletePerson = (index) => {
    const newPeople = people.filter((_, i) => i !== index);
    setPeople(newPeople);
  };

  const clearSpentValues = () => {
    const newPeople = people.map(p => ({ ...p, spent: 0 }));
    setPeople(newPeople);
  };

  const addPerson = () => {
    setPeople([...people, { name: "", spent: 0, alias: "", enabled: true }]);
  };

  const calculate = () => {
    const activePeople = people.filter(p => p.enabled);
    const total = activePeople.reduce((sum, p) => sum + p.spent, 0);
    const perPerson = total / activePeople.length;

    const balances = activePeople.map(p => ({ ...p, balance: p.spent - perPerson }));
    const creditors = balances.filter(p => p.balance > 0).sort((a, b) => b.balance - a.balance);
    const debtors = balances.filter(p => p.balance < 0).sort((a, b) => a.balance - b.balance);

    const transfers = [];
    let i = 0, j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(-debtor.balance, creditor.balance);

      transfers.push({ from: debtor.name, to: creditor.name, alias: creditor.alias, amount: amount.toFixed(2) });

      debtor.balance += amount;
      creditor.balance -= amount;

      if (Math.abs(debtor.balance) < 0.01) i++;
      if (Math.abs(creditor.balance) < 0.01) j++;
    }

    setResults(transfers);
  };

  return (
    <div className="p-4 max-w-full sm:max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">División de Gastos de Fiesta</h1>

      {people.map((person, index) => (
        <div key={index} className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-center mb-3">
          <input
            className="border rounded p-2"
            placeholder="Nombre"
            value={person.name}
            onChange={(e) => handleChange(index, "name", e.target.value)}
          />
          <input
            className="border rounded p-2"
            type="number"
            placeholder="Gastado"
            value={person.spent}
            onChange={(e) => handleChange(index, "spent", e.target.value)}
          />
          <input
            className="border rounded p-2 w-48" placeholder="Alias"
            value={person.alias}
            onChange={(e) => handleChange(index, "alias", e.target.value)}
          />
          <input
            type="checkbox"
            checked={person.enabled}
            onChange={() => handleToggle(index)}
            className="p-0 m-0"
          />
          <button
            onClick={() => deletePerson(index)}
            className="text-red-500 hover:text-red-700 text-xl p-0 m-0"
            title="Eliminar persona"
          >
            🗑️
          </button>
        </div>
      ))}

      <div className="flex flex-wrap gap-2 mt-4">
        <button onClick={addPerson} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Agregar Persona
        </button>
        <button onClick={calculate} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Calcular
        </button>
        <button onClick={clearSpentValues} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
          Borrar Gastos
        </button>
              <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => {
              const data = JSON.stringify(people, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'partyPeople.json';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Exportar Datos
          </button>
          <label className="bg-white border px-4 py-2 rounded hover:bg-gray-50 cursor-pointer">
            Importar Datos
            <input
              type="file"
              accept="application/json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                  try {
                    const data = JSON.parse(event.target.result);
                    if (Array.isArray(data)) setPeople(data);
                  } catch (err) {
                    alert("Error al importar el archivo JSON.");
                  }
                };
                reader.readAsText(file);
              }}
              className="hidden"
            />
          </label>
        </div>

        {results.length > 0 && (
        <div className="mt-6 bg-gray-100 p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-3">Transferencias</h2>
          {results.map((r, idx) => (
            <div key={idx} className="mb-1">
              {r.from} debe pagar ${r.amount} a {r.to} (Alias: {r.alias})
            </div>
          ))}
        </div>
      )}
    

      </div>

      {results.length > 0 && (
        <div className="mt-6 bg-gray-100 p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-3">Transferencias</h2>
          {results.map((r, idx) => (
            <div key={idx} className="mb-1">
              {r.from} debe pagar ${r.amount} a {r.to} (Alias: {r.alias})
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
