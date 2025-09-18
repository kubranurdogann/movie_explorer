import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./index.css";
import React from "react";
import KeenSlider, { type KeenSliderInstance } from "keen-slider";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  score?: number;
}

interface GenreGroup {
  genre: string;
  movies: Movie[];
}

export default function Movies() {
  const [groupedMovies, setGroupedMovies] = useState<GenreGroup[]>([]);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [query, setQuery] = useState("");
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(true);

  const sliderRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const fetchGroupedMovies = async () => {
      try {
        setLoadingGroups(true);
        const res = await axios.get(
          "http://localhost:3000/movies/grouped-by-genre"
        );
        setGroupedMovies(res.data);
      } catch (error) {
        console.error("Filmler alınamadı:", error);
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchGroupedMovies();
  }, []);

  useEffect(() => {
    const sliders: KeenSliderInstance[] = [];

    sliderRefs.current.forEach((ref) => {
      if (ref) {
        const slider = new KeenSlider(ref, {
          loop: false,
          mode: "free",
          slides: {
            perView: 5,
            spacing: 15,
          },
          breakpoints: {
            "(max-width: 640px)": {
              slides: { perView: 2, spacing: 10 },
            },
            "(max-width: 768px)": {
              slides: { perView: 3, spacing: 12 },
            },
            "(max-width: 1024px)": {
              slides: { perView: 5, spacing: 15 },
            },
          },
        });
        sliders.push(slider);
      }
    });

    return () => {
      sliders.forEach((s) => s.destroy());
    };
  }, [groupedMovies]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim() === "") {
      setSearchResults([]);
      return;
    }

    try {
      setLoadingSearch(true);
      const res = await axios.get(
        `http://localhost:3000/movies/semantic-search?q=${encodeURIComponent(
          value
        )}`
      );
      setSearchResults(res.data);
    } catch (error) {
      console.error("Arama sonuçları alınamadı:", error);
    } finally {
      setLoadingSearch(false);
    }
  };

  const getPoster = (path: string) => {
    return path.startsWith("http")
      ? path
      : `https://image.tmdb.org/t/p/w300${path}`;
  };

  const [searchSliderRef] = useKeenSlider<HTMLDivElement>({
    mode: "free",
    slides: {
      perView: 5,
      spacing: 15,
    },
    breakpoints: {
      "(max-width: 640px)": { slides: { perView: 2, spacing: 10 } },
      "(max-width: 768px)": { slides: { perView: 3, spacing: 12 } },
      "(max-width: 1024px)": { slides: { perView: 5, spacing: 15 } },
    },
  });

  return (
    <div className="body-color2">

      <div className="position-relative search-area">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="bi bi-search search-icon text-muted"
          viewBox="0 0 16 16"
        >
          <path d="M6.5 4.482c1.664-1.673 5.825 1.254 0 5.018-5.825-3.764-1.664-6.69 0-5.018" />
          <path d="M13 6.5a6.47 6.47 0 0 1-1.258 3.844q.06.044.115.098l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1-.1-.115h.002A6.5 6.5 0 1 1 13 6.5M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Film veya kategori ara..."
          className="w-full search-input sticky-top fixed-top"
          onFocus={(e) => e.target.classList.add("shadow-lg", "border-primary")}
          onBlur={(e) =>
            e.target.classList.remove("shadow-lg", "border-primary")
          }
        />
      </div>

      {(loadingGroups || loadingSearch) && (
        <div className="d-flex flex-column align-items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-arrow-clockwise text-light"
            viewBox="0 0 16 16"
          >
            <path
              fill-rule="evenodd"
              d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"
            />
            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
          </svg>
          <p className="text-center text-light italic">Filmler Yükleniyor...</p>
        </div>
      )}

      {query && !loadingSearch && searchResults.length === 0 && (
        <p className="text-center text-light  italic">Hiç sonuç bulunamadı.</p>
      )}

      {query && searchResults.length > 0 && (
        <div>
          <h3 className=" font-bold mb-4 text-light ms-5">
            Arama Sonuçları ({searchResults.length})
          </h3>
          <div className="row">
            {searchResults.map((movie) => (
              <div className="col-3">
                <div key={movie.id}>
                  <div className="rounded shadow-md hover:shadow-lg transition flex flex-col items-center movie-area ">
                    <img
                      src={getPoster(movie.poster_path)}
                      alt={movie.title}
                      className="w-full h-64 object-cover rounded search-movie-img"
                    />
                    <div className="p-2 text-center">
                      <h3 className="font-semibold text-sm truncate text-light">
                        {movie.title}
                      </h3>

                      {movie.score !== undefined && (
                        <p className="text-xs text-green-600 font-semibold mt-1 text-light">
                          Eşleşme: {(movie.score * 100).toFixed(1)}%
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!query &&
        groupedMovies.length > 0 &&
        groupedMovies.map((group, index) => (
          <div key={group.genre} className="mb-10 p-3 ">
            <h2 className="text-2xl font-bold mb-4 text-light">
              {group.genre}
            </h2>
            <div
              ref={(el) => {
                sliderRefs.current[index] = el;
              }}
              className="keen-slider w-full"
            >
              {group.movies.map((movie) => (
                <div
                  key={movie.id}
                  className="keen-slider__slide flex flex-col items-center rounded shadow-md hover:shadow-lg transition movie-area "
                >
                  <img
                    src={getPoster(movie.poster_path)}
                    alt={movie.title}
                    className="w-full h-64 object-cover rounded movie-img"
                  />
                  <div className="p-2 text-center">
                    <h3 className="font-semibold text-sm truncate text-light">
                      {movie.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
