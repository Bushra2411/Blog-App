
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaThumbsUp, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import "./postdetails.css";

function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/posts/${id}`)
      .then((res) => {
        setPost(res.data);
        if (res.data.cat) {
          axios
            .get(`http://localhost:5000/api/posts?cat=${res.data.cat}`)
            .then((relatedRes) => {
              const filtered = relatedRes.data.filter(p => p._id !== id);
              setRelatedPosts(filtered);
            });
        }
      })
      .catch((err) => console.error("Failed to load post:", err));
  }, [id]);

  const handleDelete = () => {
    axios
      .delete(`http://localhost:5000/api/posts/${id}`, {
        data: { username: user?.username },
      })
      .then(() => navigate("/"))
      .catch((err) => console.error("Failed to delete post:", err));
  };

  const handleLike = () => {
    if (!user) {
      alert("You need to log in to like a post.");
      return;
    }

    axios
      .put(`http://localhost:5000/api/posts/like/${id}`, {
        username: user.username,
      })
      .then((res) => {
        setPost((prevPost) => ({
          ...prevPost,
          likes: res.data.likes,
        }));
      })
      .catch((err) => console.error("Like failed:", err));
  };

  if (!post) return <p className="loading">Loading...</p>;

  const hasLiked = post.likes?.includes(user?.username);

  return (
    <div className="details-wrapper">
      <div className="post-section">
        <button
          className="icon-btn close-btn"
          onClick={() => navigate(-1)}
          aria-label="Close"
        >
          <FaTimes size={20} />
        </button>

        <div className="post-content-wrapper">
          <h1 className="post-title">{post.title}</h1>
          <p className="post-author">By <strong>{post.username}</strong></p>

          {post.photo && (
            <img
              className="post-image"
              src={`http://localhost:5000/images/${post.photo}`}
              alt={post.title}
            />
          )}

          <div
            className="post-body"
            dangerouslySetInnerHTML={{ __html: post.desc }}
          ></div>

          <div className="post-actions">
            <button
              className={`icon-btn like-btn ${hasLiked ? "liked" : ""}`}
              onClick={handleLike}
            >
              <FaThumbsUp color={hasLiked ? "blue" : "black"} /> Like ({post.likes?.length || 0})
            </button>

            {user?.username === post.username && (
              <>
                <button
                  className="icon-btn edit-btn"
                  onClick={() => navigate(`/edit/${post._id}`)}
                >
                  <FaEdit /> Edit
                </button>
                <button className="icon-btn delete-btn" onClick={handleDelete}>
                  <FaTrash /> Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <aside className="sidebar">
        <h3>More in <em>{post.cat}</em></h3>
        <div className="related-posts">
          {relatedPosts.map((relPost) => (
            <Link
              to={`/post/${relPost._id}`}
              className="related-card"
              key={relPost._id}
            >
              <img
                src={`http://localhost:5000/images/${relPost.photo}`}
                alt={relPost.title}
              />
              <div>
                <h4>{relPost.title}</h4>
                <p className="related-author">By {relPost.username}</p>
              </div>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}

export default PostDetails;
