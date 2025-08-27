import { useEffect, useState } from "react";
import axios from "axios";
import Search from "./search";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
}

interface GenreMovies {
  genre: string;
  movies: Movie[];
}

function App() {
  const [genreMovies, setGenreMovies] = useState<GenreMovies[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState(false); // ✅ yeni state

useEffect(() => {
  const fetchGroupedMovies = async () => {
    try {
      const res = await axios.get<GenreMovies[]>(
        "http://localhost:3000/movies/grouped-by-genre"
      );
      setGenreMovies(res.data);
    } catch (err: any) {
      setError("Filmler yüklenemedi!");
    } finally {
      setLoading(false);
    }
  };
  fetchGroupedMovies();
}, []);


  return (
    <div className="container" style={{ padding: "20px" }}>
      {/* ✅ isSearching state’ini Search componentine gönderiyoruz */}
      <Search setIsSearching={setIsSearching} />

      {/* ✅ Eğer arama varsa kategorileri gizliyoruz */}
      {!isSearching && genreMovies.map((group) => (
        <div key={group.genre} style={{ marginBottom: "40px" }}>
          <h2>{group.genre}</h2>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {group.movies.map((movie) => (
              <div
                key={movie.id}
                style={{
                  margin: "10px",
                  width: "150px",
                  textAlign: "center",
                }}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                  alt={movie.title}
                  style={{ borderRadius: "10px", maxWidth: "100%" }}
                />
                <p>{movie.title}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
