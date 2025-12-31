import React, { useEffect, useState } from "react";
import { AES } from "crypto-js";
import Cookies from "js-cookie";
import Header from "@/components/layout/Header";
import UsersApis from "@/services/users/users.api";
import { QueryClient, useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import Link from "next/link";

interface User {
  id?: string;
  name?: string;
  email?: string;
  username?: string;
  location?: string;
  created_at?: string;
  account_status?: string;
  last_activity?: string;
  hunted?: number;
  portfolio?: number;
  comments_given?: number;
  comments_received?: number;
  upvotes_given?: number;
  votes_received?: number;
  top_upvotes_received?: number;
  top_ten?: number;
  followers_count?: number;
  following_count?: number;
  login?: string;
  instagram_link?: string;
  pro_member?: number | string;
  personal_photo_count?: number;
  vault_count?: number;
  is_personal_site?: boolean | number | string;
  personal_website_url?: string;
  reports_count?: number;
  personal_page_followers_count?: number;
}

interface UserListResponse {
  users_data: User[];
  total_users: string;
  yesterday_new_users?: string;
  server_time?: string;
}

export default function Home() {
  const queryClient = useQueryClient();

  const storedData = Cookies.get("PhotoContestCMS.");
  const parsedData = storedData ? JSON.parse(storedData) : null;

  const [limit, setLimit] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUsername, setNewUsername] = useState<string>("");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<"username" | "status" | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortType, setSortType] = useState<"ASC" | "DESC">("ASC");
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [debouncedSearchKeyword, setDebouncedSearchKeyword] = useState<string>("");

  const openEditModal = (user: User) => {
    setNewUsername(user.name || "");
    setSelectedUser(user);
    setModalType("username");
    setIsModalOpen(true);
  };

  const openStatusModal = (user: User, status: string) => {
    setSelectedUser(user);
    setSelectedStatus(status);
    setModalType("status");
    setIsModalOpen(true);
  };

  const toggleStatusDropdown = (userId: string) => {
    setOpenDropdownId((prev) => (prev === userId ? null : userId));
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && !target.closest(".status")) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  // Debouncing effect for search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchKeyword(searchKeyword);
      setCurrentPage(1); // Reset to first page when searching
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchKeyword]);

  const { mutate: updateUserName, isPending: UpdateUserNameLoading } = useMutation({
    mutationFn: async (payload: { userId: string; name: string }) => {
      await UsersApis.UpdateUserName(payload);
      return payload;
    },
    onSuccess: ({ userId, name }) => {
      queryClient.setQueryData<UserListResponse>(["users", currentPage, limit, sortBy, sortType, debouncedSearchKeyword], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          users_data: oldData.users_data.map((user) =>
            user.id === userId ? { ...user, name } : user
          ),
        };
      });
      setIsModalOpen(false);
      setModalType(null);
    },
    onError: (error) => {
      console.error("Error updating username:", error);
    },
  });

  const { mutate: updateUserStatus, isPending: UpdateUserStatusLoading } = useMutation({
    mutationFn: async (payload: { userId: string; status: string }) => {
      await UsersApis.UpdateUserName(payload);
      return payload;
    },
    onSuccess: ({ userId, status }) => {
      queryClient.setQueryData<UserListResponse>(["users", currentPage, limit, sortBy, sortType, debouncedSearchKeyword], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          users_data: oldData.users_data.map((user) =>
            user.id === userId ? { ...user, account_status: status } : user
          ),
        };
      });
      setOpenDropdownId(null);
      setIsModalOpen(false);
      setModalType(null);
    },
    onError: (error) => {
      console.error("Error updating user status:", error);
    },
  });

  const UpdateUserHandler = async () => {
    if (!selectedUser?.id || !newUsername.trim()) return;
    updateUserName({ userId: selectedUser.id, name: newUsername.trim() });
  };

  const UpdateStatusHandler = async () => {
    if (!selectedUser?.id || !selectedStatus) return;
    updateUserStatus({ userId: selectedUser.id, status: selectedStatus });
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortType(sortType === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(column);
      setSortType("ASC");
    }
    setCurrentPage(1);
  };

  const { data: userData, isLoading } = useQuery<UserListResponse>({
    queryKey: ["users", currentPage, limit, sortBy, sortType, debouncedSearchKeyword],
    queryFn: async () => {
      const offset = (currentPage - 1) * limit;
      const payload = {
        offSet: offset,
        limit,
        ...(sortBy && { sortBy }),
        ...(sortBy && { sortType }),
        ...(debouncedSearchKeyword && { searchKeyword: debouncedSearchKeyword }),
      };
      const response = await UsersApis.GetUserList(payload);
      return response.data.data[0];
    },
    enabled: !!parsedData?.token,
    placeholderData: keepPreviousData,
  });

  const totalUsers = parseInt(userData?.total_users || "0");
  const totalPages = Math.ceil(totalUsers / limit);

  const getVisiblePages = () => {
    const pages: (number | "...")[] = [];
    const total = totalPages;

    if (total <= 10) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", total - 2, total - 1, total);
      } else if (currentPage >= total - 3) {
        pages.push(1, 2, 3, "...", total - 4, total - 3, total - 2, total - 1, total);
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          total
        );
      }
    }

    return pages;
  };

  const OtheruserProfileNavigateHandler = (UserID: string) => {
    const userData = {
      PhotoID: "",
      UserID,
    };

    const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY_FOR_FRONTEND;
    const encryptedUserData = AES.encrypt(JSON.stringify(userData), secretKey!).toString();
    const encoded = encodeURIComponent(encryptedUserData);

    const url = `https://example.com/otherusers-profile?userdata=${encoded}`;
    window.open(url, "_blank");
  };

  const columnMapping: { [key: string]: string } = {
    "Account Status": "account_status",
    "User Name": "name",
    Email: "email",
    Login: "login",
    Instagram: "instagram_link",
    Location: "location",
    "Last Activity": "last_activity",
    Hunted: "hunted",
    Portfolio: "portfolio",
    "Comments G": "comments_given",
    "Comments R": "comments_received",
    "Upvotes G": "upvotes_given",
    "Upvotes R": "votes_received",
    "Top Upvotes": "top_upvotes_received",
    "Top Ten": "top_ten",
    Followers: "followers_count",
    Following: "following_count",
  };

  return (
    <>
      <div>
        <Header />
        <section className="users-section">
          <div className="container-fluid">
            <div className="row">
              <div className="col">
                <div className="users_section_wrap">
                  <div className="user_header">
                    <div style={{ display: 'flex', gap: '20px' }}>


                      <div className="total_users">
                        <span>Total Users</span>
                        <span className="no">{totalUsers}</span>
                        <span className="additional">{userData?.yesterday_new_users}</span>
                      </div>


                      <div className="search_users" style={{ position: "relative", display: "flex", alignItems: "end" }}>
                        <div style={{ position: "relative" }}>
                          <input
                            type="text"
                            placeholder="Search by First Name, Last Name, Email..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            className="form-control"
                            style={{
                              padding: "8px 12px 8px 40px",
                              borderRadius: "4px",
                              minWidth: "300px",

                            }}
                          />
                          <svg
                            style={{
                              position: "absolute",
                              left: "12px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              width: "16px",
                              height: "16px",
                              color: "#999"
                            }}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="server_time">
                      <span>{userData?.server_time} (GMT)</span>
                      <span className="date" id="currentDate" />
                      <span className="time" id="currentTime" />
                    </div>
                  </div>

                  <div className="table-responsive users_table">
                    <table className="table align-middle table-bordered">
                      <thead>
                        <tr>
                          <th>
                            <div className="checkbox">
                              <input type="checkbox" name="all" id="all" />
                              <label htmlFor="all" />
                            </div>
                          </th>
                          <th>Profile</th>
                          {/* <th>Account Status</th> */}
                          {[
                            "Account Status",
                            "User Name",
                            "Email",
                            "Login",
                            "Instagram",
                            "Location",
                            "Last Activity",
                            "Pro",
                            "PP",
                            "V",
                            "R",
                            "PPF",
                            "Hunted",
                            "Portfolio",
                            "Comments G",
                            "Comments R",
                            "Upvotes G",
                            "Upvotes R",
                            "Top Upvotes",
                            "Top Ten",
                            "Followers",
                            "Following",
                          ].map((header) => (
                            <th
                              key={header}
                              onClick={() => handleSort(columnMapping[header])}
                              style={{ cursor: "pointer" }}
                            >
                              {header}
                              {sortBy === columnMapping[header] && (
                                <span>{sortType === "ASC" ? " ↑" : " ↓"}</span>
                              )}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      {userData && (
                        <tbody>
                          {userData.users_data?.map((data: User) => (
                            <tr key={data.id || data.email}>
                              <td>
                                <div className="checkbox">
                                  <input
                                    type="checkbox"
                                    className="row-checkbox"
                                    id={`user1-${data.id || data.email}`}
                                  />
                                  <label htmlFor={`user1-${data.id || data.email}`} />
                                </div>
                              </td>
                              <td>
                                <a
                                  className="profile_btn"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => OtheruserProfileNavigateHandler(data.id!)}
                                >
                                  Go to Profile
                                  <img src="./assets/img/icons/link.svg" alt="link" />
                                </a>
                              </td>
                              <td>
                                <div className="status">
                                  <span
                                    className={`${data?.account_status?.toLowerCase()}`}
                                    onClick={() => toggleStatusDropdown(data.id!)}
                                    style={{ cursor: "pointer" }}
                                  >
                                    {data?.account_status}
                                  </span>
                                  <ul
                                    className="status_list"
                                    style={{
                                      display: openDropdownId === data.id ? "block" : "none",
                                    }}
                                  >
                                    <li>
                                      <button
                                        className="active"
                                        onClick={() => openStatusModal(data, "Active")}
                                        disabled={UpdateUserStatusLoading}
                                      >
                                        Active
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                        className="pause"
                                        onClick={() => openStatusModal(data, "Pause")}
                                        disabled={UpdateUserStatusLoading}
                                      >
                                        Pause
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                        className="closed"
                                        onClick={() => openStatusModal(data, "Closed")}
                                        disabled={UpdateUserStatusLoading}
                                      >
                                        Closed
                                      </button>
                                    </li>
                                  </ul>
                                </div>
                              </td>
                              <td className="ellipsis">
                                <span className="editableName">
                                  <span className="name">{data.name || "_"}</span>
                                  <a
                                    className="img editButton"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      openEditModal(data);
                                    }}
                                  >
                                    <img src="./assets/img/icons/pencil.svg" alt="Edit" />
                                  </a>
                                </span>
                              </td>
                              <td className="ellipsis">
                                <a>{data.email}</a>
                              </td>
                              <td className="text-center">
                                <a>
                                  <img src={`./assets/img/icons/${data.login}.svg`} alt="login" />
                                </a>
                              </td>
                              <td className="ellipsis">
                                <Link
                                  href={`https://www.instagram.com/${data?.instagram_link}`}
                                  target="_blank"
                                >
                                  {data.instagram_link || "_"}
                                </Link>
                              </td>
                              <td className="ellipsis">{data.location || "_"}</td>
                              <td className="ellipsis">{data.last_activity || "_"}</td>
                              <td>{data?.pro_member}</td>
                              <td>{data?.is_personal_site ?
                                <>
                                  <Link
                                    href={`https:${data?.personal_website_url}`}
                                    target="_blank"
                                  >
                                    {data?.personal_photo_count}
                                  </Link>

                                </> : 0}
                              </td>
                              <td>{data?.vault_count ? data?.vault_count : 0}</td>
                              <td>{data?.reports_count}</td>
                              <td>{data.personal_page_followers_count}</td>
                              <td>
                                {Number(data.hunted) > 0 ? (
                                  <Link href={`/user-images/?id=${data.id}&type=hunted&name=${data.name}&totalphoto=${data.hunted}`}>{data.hunted}</Link>
                                ) : (
                                  data.hunted
                                )}
                              </td>
                              <td>
                                {Number(data.portfolio) > 0 ? (
                                  <Link href={`/user-images/?id=${data.id}&type=portfolio&name=${data.name}&totalphoto=${data.portfolio}`}>{data.portfolio}</Link>
                                ) : (
                                  data.portfolio
                                )}
                              </td>

                              <td >{data.comments_given}</td>
                              <td >{data.comments_received}</td>
                              <td >{data.upvotes_given}</td>
                              <td >{data.votes_received}</td>
                              <td >{data.top_upvotes_received ?? 0}</td>
                              <td >{data.top_ten}</td>
                              <td >{data.followers_count}</td>
                              <td >{data.following_count}</td>
                            </tr>
                          ))}
                        </tbody>
                      )}
                    </table>
                  </div>

                  <div className="user_bottom">
                    <div className="showing_items">
                      <span className="status">
                        Showing: {(currentPage - 1) * limit + 1} -{" "}
                        {Math.min(currentPage * limit, totalUsers)} of {totalUsers}
                      </span>
                      <select
                        name="shown"
                        id="shown"
                        value={limit}
                        onChange={(e) => {
                          setCurrentPage(1);
                          setLimit(Number(e.target.value));
                        }}
                      >
                        <option value={10}>10</option>
                        <option value={100}>100</option>
                        <option value={250}>250</option>
                        <option value={500}>500</option>
                        <option value={1000}>1000</option>
                      </select>
                    </div>

                    <ul className="users_pagination">
                      <li>
                        <a
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        >
                          <img src="./assets/img/icons/angle-left.svg" alt="prev" />
                        </a>
                      </li>

                      {getVisiblePages().map((page, idx) =>
                        page === "..." ? (
                          <li key={`dots-${idx}`}>
                            <span>...</span>
                          </li>
                        ) : (
                          <li key={page} className={page === currentPage ? "active" : ""}>
                            <a onClick={() => setCurrentPage(page)}>{page}</a>
                          </li>
                        )
                      )}

                      <li>
                        <a
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        >
                          <img src="./assets/img/icons/angle-right.svg" alt="next" />
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {isModalOpen && (
        <>
          <div className="backdrop" />
          <div className="modal action_modal" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content modal_content">
                <button
                  type="button"
                  className="modal_close"
                  onClick={() => {
                    if (!UpdateUserNameLoading && !UpdateUserStatusLoading) {
                      setIsModalOpen(false);
                      setModalType(null);
                    }
                  }}
                  disabled={UpdateUserNameLoading || UpdateUserStatusLoading}
                >
                  <img src="./assets/img/icons/cross.svg" alt="Close" />
                </button>

                {modalType === "username" ? (
                  <>
                    <h4 className="modal_title">Change User Name</h4>
                    <div className="modal_desc">
                      You're about to change user data. This action will update the username across the platform.
                    </div>
                    <div className="form_group" style={{ marginTop: "10px" }}>
                      <input
                        type="text"
                        placeholder="Enter new username"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        disabled={UpdateUserNameLoading}
                      />
                    </div>
                    <div className="modal_buttons mt-4">
                      <button
                        className="btn yes"
                        onClick={UpdateUserHandler}
                        disabled={UpdateUserNameLoading || !newUsername.trim()}
                      >
                        {UpdateUserNameLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Updating...
                          </>
                        ) : (
                          "Confirm Update"
                        )}
                      </button>
                      <button
                        className="btn no"
                        onClick={() => {
                          if (!UpdateUserNameLoading) {
                            setIsModalOpen(false);
                            setModalType(null);
                          }
                        }}
                        disabled={UpdateUserNameLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h4 className="modal_title">Change User Status</h4>
                    <div className="modal_desc">
                      You're about to change the user status to <strong>{selectedStatus}</strong>. This action will update the status across the platform.
                    </div>
                    <div className="modal_buttons mt-4">
                      <button
                        className="btn yes"
                        onClick={UpdateStatusHandler}
                        disabled={UpdateUserStatusLoading}
                      >
                        {UpdateUserStatusLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Updating...
                          </>
                        ) : (
                          "Yes"
                        )}
                      </button>
                      <button
                        className="btn no"
                        onClick={() => {
                          if (!UpdateUserStatusLoading) {
                            setIsModalOpen(false);
                            setModalType(null);
                          }
                        }}
                        disabled={UpdateUserStatusLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}