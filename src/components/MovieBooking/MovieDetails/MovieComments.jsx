import React, { useState, useEffect, useContext, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../../Context/AuthProvider";
import useAxiosSecure from "../../Hooks/AxiosSecure";
import useAxiosPublic from "../../Hooks/AxiosPublic";
import userPlaceholder from "../../../assets/user_2.png"; // Adjust path if needed

// --- REUSABLE INPUT COMPONENT ---
const CommentInput = ({ movieId, parentId = null, repliedToUsername = null, onCommentAdded, onCancel }) => {
  const { userData, session } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log(session)

  const handleSubmit = async () => {
    if (!content.trim()) return;
    if (!userData) {
      alert("Please log in to comment."); // Replace with your toast notification
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        movieId,
        content: content.trim(),
        parentId,
        repliedToUsername
      };

      const res = await axiosSecure.post("/comments", payload);
      onCommentAdded(res.data);
      setContent("");
      if (onCancel) onCancel();
    } catch (error) {
      console.error("Failed to post comment", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex gap-3 sm:gap-4 w-full mt-4">
      <img
        src={userData?.profilePic || userPlaceholder}
        alt="User"
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-slate-800 shrink-0"
      />
      <div className="flex-1 flex flex-col gap-2">
        {repliedToUsername && (
          <span className="text-xs text-indigo-400 poppins-medium flex items-center gap-1">
            Replying to @{repliedToUsername.split("@")[0]}
          </span>
        )}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={parentId ? "Add a reply..." : "Add a comment..."}
          className="w-full bg-transparent border-b border-slate-700 text-slate-200 poppins-light placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none overflow-hidden transition-colors duration-300 min-h-[40px] py-1 text-sm sm:text-base"
          rows={1}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
        />
        {(content.length > 0 || onCancel) && (
          <div className="flex justify-end gap-2 mt-2">
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-full text-sm poppins-medium text-slate-400 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim()}
              className="px-5 py-2 rounded-full text-sm poppins-medium bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]"
            >
              {isSubmitting ? "Posting..." : parentId ? "Reply" : "Comment"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- SINGLE THREAD COMPONENT ---
const CommentThread = ({ thread, movieId }) => {
  const axiosPublic = useAxiosPublic();
  const [replies, setReplies] = useState([]);
  const [showReplies, setShowReplies] = useState(false);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null); // { parentId, repliedToUsername }

  const fetchReplies = async () => {
    if (showReplies) {
      setShowReplies(false);
      return;
    }

    setIsLoadingReplies(true);
    try {
      const res = await axiosPublic.get(`/comments/${thread.id}/replies`);
      setReplies(res.data);
      setShowReplies(true);
    } catch (error) {
      console.error("Failed to load replies", error);
    } finally {
      setIsLoadingReplies(false);
    }
  };

  const handleReplyAdded = (newReply) => {
    setReplies((prev) => [...prev, newReply]);
    setShowReplies(true);
    setIsReplying(false);
  };

  const openReplyBox = (targetUsername) => {
    setReplyTarget({ parentId: thread.id, repliedToUsername: targetUsername });
    setIsReplying(true);
  };



  const renderCommentBody = (comment, isReply = false) => (
    <div className="flex gap-3 sm:gap-4 group">
      <img src={comment.profile || userPlaceholder} alt={comment.authorUsername} className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-slate-800" />
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-white text-sm sm:text-base poppins-medium">{comment.fullName || "User"}</span>
          <span className="text-slate-500 text-xs poppins-light">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="text-slate-300 text-sm sm:text-base poppins-light mt-1 whitespace-pre-wrap">
          {comment.repliedToUsername && (
            <span className="text-indigo-400 font-medium mr-1">@{comment.repliedToUsername}</span>
          )}
          {comment.content}
        </p>
        <div className="flex items-center gap-4 mt-2">
          <button className="text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1 text-sm poppins-medium">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.514"></path></svg>
             {comment.upvotes || 0}
          </button>
          <button
            onClick={() => openReplyBox(isReply ? comment.authorUsername : null)}
            className="text-xs poppins-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full transition-colors"
          >
            Reply
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Top Level Comment */}
      {renderCommentBody(thread)}

      {/* Nested Replies Section */}
      <div className="ml-12 sm:ml-16 flex flex-col gap-4">
        {thread.replyCount > 0 && (
          <button
            onClick={fetchReplies}
            className="text-indigo-400 hover:text-indigo-300 text-sm poppins-medium flex items-center gap-2 self-start transition-colors"
          >
            <svg className={`w-4 h-4 transition-transform duration-300 ${showReplies ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            {showReplies ? "Hide replies" : `View ${thread.replyCount} replies`}
          </button>
        )}

        <AnimatePresence>
          {showReplies && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-5 overflow-hidden"
            >
              {isLoadingReplies ? (
                <div className="animate-pulse bg-slate-800/50 h-10 w-full rounded-md"></div>
              ) : (
                replies.map((reply) => (
                  <div key={reply.id}>{renderCommentBody(reply, true)}</div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Reply Box attached to this thread */}
        <AnimatePresence>
          {isReplying && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}>
              <CommentInput
                movieId={movieId}
                parentId={replyTarget?.parentId}
                repliedToUsername={replyTarget?.repliedToUsername}
                onCommentAdded={handleReplyAdded}
                onCancel={() => setIsReplying(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- MAIN COMMENT SECTION CONTAINER ---
const MovieComments = ({ movieId }) => {
  const axiosPublic = useAxiosPublic();
  const [threads, setThreads] = [useState([]), useState([])][0]; // To avoid destructuring clash, proper initialization below
  const [topComments, setTopComments] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const fetchComments = useCallback(async (pageNum) => {
    if (!movieId) return;
    setIsLoading(true);
    try {
      const res = await axiosPublic.get(`/comments/movie/${movieId}?page=${pageNum}&size=10`);
      if (pageNum === 0) {
        setTopComments(res.data.content);
      } else {
        setTopComments(prev => [...prev, ...res.data.content]);
      }
      setHasMore(!res.data.last);
    } catch (error) {
      console.error("Error fetching comments", error);
    } finally {
      setIsLoading(false);
    }
  }, [movieId, axiosPublic]);

  useEffect(() => {
    setPage(0);
    fetchComments(0);
  }, [fetchComments]);

  const handleNewTopLevelComment = (newComment) => {
    setTopComments(prev => [newComment, ...prev]);
  };


  return (
    <div className="w-full max-w-[90rem] mx-auto mt-8 mb-16 px-4 sm:px-6 lg:px-12 bg-[#0a0f1a]">
      <div className="border-t border-slate-800/80 pt-10">
        <h2 className="poppins-semibold text-2xl md:text-3xl mb-8 flex items-center gap-3 text-white">
          Comments
          <span className="bg-white/10 text-slate-300 text-sm py-1 px-3 rounded-full border border-white/10">
            {/* You can add total comment count here if API provides it */}
            Discussion
          </span>
        </h2>

        {/* Top Level Input */}
        <div className="mb-10 bg-slate-900/30 p-4 sm:p-6 rounded-2xl border border-slate-800/50 shadow-inner">
          <CommentInput movieId={movieId} onCommentAdded={handleNewTopLevelComment} />
        </div>

        {/* Comment Threads List */}
        <div className="flex flex-col gap-8">
          {topComments.map(thread => (
            <CommentThread key={thread.id} thread={thread} movieId={movieId} />
          ))}

          {topComments.length === 0 && !isLoading && (
            <p className="text-slate-500 poppins-light text-center py-8">Be the first to share your thoughts on this movie!</p>
          )}

          {isLoading && (
            <div className="flex justify-center my-6">
              <span className="loading loading-spinner loading-md text-indigo-500"></span>
            </div>
          )}

          {hasMore && !isLoading && topComments.length > 0 && (
             <div className="flex justify-center mt-4">
               <button
                 onClick={() => {
                   const nextPage = page + 1;
                   setPage(nextPage);
                   fetchComments(nextPage);
                 }}
                 className="px-6 py-2 rounded-full border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors poppins-medium text-sm"
               >
                 Load More Comments
               </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(MovieComments);