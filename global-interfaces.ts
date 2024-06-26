import { PostApiResponse } from "./services/postService";

export interface RootState {
  posts: PostsState;
  postsFilters: FiltersState;
  auth: AuthState;
}

export interface ApiError {
  data?: {
    error?: string;
  };
  status?: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  loginModalOpen: boolean;
}

// For MooseChat bot messages (moose-gpt-1, 2, 3)
export interface Message {
  isUser: boolean;
  text: string;
}

// For Language Assistant Bot (moose-gpt-translate)
export interface Language {
  id: string;
  title: string;
  country: string;
}

export interface FiltersState {
  searchTerm?: string;
  isFeatured?: boolean;
  categoryTerms?: string[];
  postTagTerms?: string[];
  currentPage: number;
  postsPerPage: number;
  switchButtonEnabled: boolean;
}

export interface PostsState {
  posts: PostApiResponse;
  status: "published" | "draft" | "review";
}

export interface AxiosError {
  response?: {
    status?: number;
    data?: any;
  };
}

export interface User {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  profileImage: {
    url: string;
  };
}
