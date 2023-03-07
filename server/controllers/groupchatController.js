/** @format */

const Messages = require("../models/messageModel");

const groupchat = require("../models/groupchatModel");
const { json } = require("express");
const { $where } = require("../models/messageModel");

module.exports.createGroupChat = async (req, res) => {
	if (!req.body.members || !req.body.name) {
		return res.status(400).send({ message: "Please Fill all the feilds" });
	}

	var members = JSON.parse(req.body.members);

	if (members.length < 2) {
		return res
			.status(400)
			.send("More than 2 users are required to form a group chat");
	}
	//console.log("member :" + members);
	members.push(req.members);

	try {
		const groupChat = await groupchat.create({
			name: req.body.name,
			members: members,
		});

		const fullGroupChat = await groupchat
			.findOne({ _id: groupChat._id })
			.populate("members");

		res.status(200).json(fullGroupChat);
	} catch (error) {
		res.status(400);
		throw new Error(error.message);
	}
};

//add to group
module.exports.addToGroup = async (req, res) => {
	const { chatId, userId } = req.body;

	// check if the requester is admin

	const added = await groupchat
		.findByIdAndUpdate(
			chatId,
			{
				$push: { members: userId },
			},
			{
				new: true,
			}
		)
		.populate("members", "-password");
	if (!added) {
		res.status(404);
		throw new Error("Chat Not Found");
	} else {
		res.json(added);
	}
};

//addmessage
module.exports.addMessageGroup = async (req, res, next) => {
	const { name, from, messages } = req.body;
	const data = await groupchat.findOne({ name });
	//console.log(`data : ${JSON.stringify(data)}`);
	if (!data) {
		res.status(404).send(" name is not found in db");
		//console.log("data");
	}

	data.messages.push({ sender: from, message: messages });
	await data.save();
	return res.status(200).send(data);
};

//new based on the user input it fetch the chats
module.exports.fetchChats = async (req, res, next) => {
	try {
		const users = await groupchat
			.find({
				$and: [{ members: { $elemMatch: { $eq: req.params.id } } }],
			})
			.select(["name", "members", "messages"]);

		//console.log(users);
		return res.json(users);
	} catch (error) {
		res.status(400);
		throw new Error(error.message);
	}
};

//fectching chats by the group name
module.exports.allchats = async (req, res) => {
	const { name, from, to } = req.body;
	try {
		const groupchats = await groupchat.find({
			name,
		});

		if (!groupchats) {
			res.status(404).send(`group name with ${name} messages not found`);
		}
		// console.log(typeof groupchats);
		// console.log(Object.values(groupchats));
		let pm;

		Object.values(groupchats).map((message) => {
			// console.log(`message : ${message.messages}`);
			//console.log(JSON.stringify(message.messages));
			pm = message.messages;
		});
		const projectMessages = pm?.map((msg) => {
			// console.log(msg.message);
			return {
				fromSelf: msg.sender.toString() === from,
				message: msg.message,
				sender: msg.sender,
			};
		});

		return res.status(200).json(projectMessages);
	} catch (err) {
		console.log(err);
	}
};
