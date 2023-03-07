/** @format */

import React from "react";
import axios from "axios";
import { useState } from "react";
import "./gpc.css";

import { allChats, allUsersRoute, searchUser } from "../utils/APIRoutes";

import { createGroup } from "../utils/APIRoutes";

const GroupChatmodal = () => {
	const [showForm, setShowForm] = useState(false);

	const [groupChatName, setGroupChatName] = useState();
	const [selectedUsers, setSelectedUsers] = useState([]);
	const [search, setSearch] = useState("");
	const [searchResult, setSearchResult] = useState([]);
	const [loading, setLoading] = useState(false);

	const handleGroup = (userToAdd) => {
		if (selectedUsers.includes(userToAdd)) {
			<li>User already added</li>;
			return;
		}

		setSelectedUsers([...selectedUsers, userToAdd]);
	};

	const handleSearch = async (query) => {
		setSearch(query);
		if (!query) {
			setSearchResult([]);
			return;
		}

		try {
			setLoading(true);

			const { data } = await axios.get(`${searchUser}?search=${search}`);
			// console.log(`while creating group ${JSON.stringify(data)}`);
			setLoading(false);
			setSearchResult(data);
		} catch (error) {
			console.log(error.msg("user not found"));
		}
	};

	const handleDelete = (delUser) => {
		setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		// form submission logic goes here

		if (!groupChatName || !selectedUsers) {
			<li>Please enter all the fields</li>;
			return;
		}
		try {
			const { data } = await axios.post(createGroup, {
				name: groupChatName,
				members: JSON.stringify(selectedUsers.map((u) => u._id)),
			});

			<li>New Group chat is Created !</li>;
		} catch (error) {
			<li>Failed to create the chat</li>;
		}
		// hide the form after submission
		setShowForm(false);
	};
	// console.log(`selected users : ${JSON.stringify(selectedUsers)}`);

	// console.log(JSON.stringify(searchResult));

	const filteredNames = searchResult.filter((user) =>
		user.username.toLowerCase().startsWith(search.toLowerCase())
	);

	return (
		<div className="main">
			<button
				onClick={() => setShowForm(!showForm)}
				style={{
					backgroundColor: "#9a86f3",
					padding: "2px",
					borderRadius: "2px",
					color: "white",
					borderColor: "#9a86f3",
				}}>
				New Group +
			</button>
			{showForm && (
				<form className="form-center" onSubmit={handleSubmit}>
					{/* Form fields go here */}

					<h3 style={{ color: "black" }}>Create your Group</h3>
					<input
						type="text"
						placeholder="Enter group name"
						onChange={(e) => setGroupChatName(e.target.value)}></input>
					<input
						type="text"
						placeholder="Add username..."
						onChange={(e) => handleSearch(e.target.value)}></input>

					<div id="selectedusers">
						<h5 style={{ color: "black" }}> selected users :</h5>
						{selectedUsers.map((u) => (
							<li key={u._id} user={u} onClick={() => handleDelete(u)}>
								*{u.username}
							</li>
						))}
					</div>
					{loading ? (
						// <ChatLoading />
						<div style={{ color: "black" }}>Loading...</div>
					) : (
						filteredNames?.map((user) => (
							<li
								key={user._id}
								user={user}
								onClick={() => handleGroup(user)}
								style={{ color: "black", padding: "5px", cursor: "pointer" }}>
								{user.username}
							</li>
						))
					)}
					<button id="create" type="submit" onClick={handleSubmit}>
						Create
					</button>
				</form>
			)}
		</div>
	);
};

export default GroupChatmodal;
