import { useState, useEffect } from "react";
import axios from "axios";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
}
export default function Search({ setIsSearching }: { setIsSearching: (v: boolean) => void }) {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMovies = async (searchTerm: string) => {
    if (!searchTerm) {
      setMovies([]);
      setIsSearching(false); // ✅ arama temizlenince kategorileri göster
      return;
    }

    setIsSearching(true); // ✅ arama yapılıyor, kategorileri gizle
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:3000/movies/search?q=${searchTerm}`
      );
      setMovies(res.data);
    } catch (error) {
      console.error("Arama hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchMovies(query);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <input
        type="text"
        placeholder="Film ara..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />

      {loading && <p className="text-gray-500">Yükleniyor...</p>}

      {movies.length > 0 && (
        <ul className="grid grid-cols-2 gap-4">
          {movies.map((movie) => (
            <li key={movie.id} className="border rounded p-2">
              <img
                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                alt={movie.title}
                className="rounded mb-2"
              />
              <h3 className="font-bold">{movie.title}</h3>
              <p className="text-sm text-gray-600">{movie.release_date}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
