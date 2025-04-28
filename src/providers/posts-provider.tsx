'use client';

import React, { createContext, useContext, useState } from 'react';

interface Post {
  id: string;
  title: string;
  body: string;
  author: string;
  date: string;
}

interface PostsContextType {
  posts: Post[];
  updatePost: (id: string, updatedPost: Post) => void;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export const PostsProvider = ({ children }: { children: React.ReactNode }) => {
  const [posts, setPosts] = useState<Post[]>([]);

  const updatePost = (id: string, updatedPost: Post) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => (post.id === id ? updatedPost : post))
    );
  };

  return (
    <PostsContext.Provider value={{ posts, updatePost }}>
      {children}
    </PostsContext.Provider>
  );
};

export const usePostsContext = () => {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error('usePostsContext must be used within a PostsProvider');
  }
  return context;
};
