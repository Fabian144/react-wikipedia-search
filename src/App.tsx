import { useState } from 'react';

type WikiApiResponse = [string, string[], string[], string[]];
type Term = { term: string; time: Date };
type Result = { title: string; url: string };

export default function App() {
  const [history, setHistory] = useState<Term[]>([]);
  const [searchTerm, setSearchTerm] = useState<Term>({ term: '', time: new Date() });
  const [results, setResults] = useState<Result[]>([]);

  const sortedHistory = history.slice().sort((a, b) => Number(a.time) - Number(b.time));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!searchTerm.term) return;
		
    handleHistory();
    const response: WikiApiResponse = await fetchResults();
    if (response) {
      const [_, title, __, link] = response;

      const newResults = title.map((name, i) => ({ title: name, url: link[i] }));
      setResults(newResults);
    }
  }

  function handleHistory() {
    const existingTerm = history.filter((h) => h.term === searchTerm.term);

    const newHistory =
      existingTerm.length > 0
        ? [
            ...existingTerm.map((h) => ({ ...h, time: new Date() })),
            ...history.filter((h) => h.term !== existingTerm[0].term),
          ]
        : [{ term: `${searchTerm.term}`, time: new Date() }, ...history.slice(0, 4)];

    setSearchTerm((prev) => ({ ...prev, term: '' }));
    setHistory(newHistory);
  }

  async function fetchResults() {
    try {
      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=opensearch&search=${searchTerm.term}&format=json&origin=*`,
      );
      return await response.json();
    } catch (error) {
      console.error('Fetch failed:', error);
    }
  }

  const resultDisplay = results.map(({ title, url }, i) => {
    return (
      <li key={i}>
        <a
          href={url}
          className="underline text-blue-500 hover:text-blue-700"
          target="_blank"
          rel="noopener noreferrer"
        >
          {title}
        </a>
      </li>
    );
  });

  const historyDisplay = sortedHistory.map(({ term, time }, i) => {
    return (
      <li className="gap-2 flex" key={i}>
        <span className="font-medium">{term} - </span>
        <span className="font-light">{time.toLocaleString()}</span>
      </li>
    );
  });

  return (
    <div className="flex flex-col justify-center items-center min-h-dvh bg-gray-100 p-4">
      <div className="flex flex-col gap-8 w-full max-w-2xl">
        <h1 className="text-3xl font-semibold text-gray-700">Wiki fetching</h1>

        <form
          onSubmit={handleSubmit}
          className="p-8 rounded-2xl shadow-md flex flex-col border border-neutral-200"
        >
          <label htmlFor="search" className="text-xl font-medium text-gray-600 mb-2">
            Search:
          </label>

          <div className="flex">
            <input
              id="search"
              onChange={(e) => setSearchTerm({ term: e.target.value, time: new Date() })}
              value={searchTerm.term}
              className="grow font-light rounded-l-lg border-gray-300 border px-4 py-2"
            />

            <button
              type="submit"
              className="bg-teal-500 text-white px-4 py-2 rounded-r-lg hover:bg-teal-600 transition-colors cursor-pointer"
            >
              Submit
            </button>
          </div>
        </form>

        <div className="grid grid-cols-2 gap-8 border p-8 border-neutral-200 rounded-2xl shadow-md min-h-96">
          <div>
            <h2 className="text-2xl mb-4">Results</h2>

            <ul>{resultDisplay}</ul>
          </div>

          <div>
            <h2 className="text-2xl mb-4">Last 5 terms</h2>

            <ul>{historyDisplay}</ul>
          </div>
        </div>
      </div>
    </div>
  );
}
