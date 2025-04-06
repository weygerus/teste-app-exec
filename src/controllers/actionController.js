const mongoose = require('mongoose');
require('dotenv').config();

require('../models/usuario')
const User = mongoose.model('User')

const fs = require('fs');
const path = require('path');

const { loadSessionFromDB } = require("../sessionMenagerDB");
const { IgApiClient } = require("instagram-private-api");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randomDelay = (min, max) => Math.random() * (max - min) + min;

exports.uploadUsersListService = async (req, res) => {

    const { userId, account } = req.params;
    const { usernames, batchSize, actionValue } = req.body

    const user = await User.findById(userId);
    const ig = new IgApiClient();

    await ig.state.generateDevice(user.username);
    const session = await loadSessionFromDB(userId, account, ig);

    if (actionValue == "Seguir") {

        const batches = [];
        for (let i = 0; i < usernames.length; i += batchSize) {
            batches.push(usernames.slice(i, i + batchSize));
        }

        console.log(`Usuários divididos em ${batches.length} lotes de até ${batchSize} usuários.`);

        console.log("usernames", usernames)

        for (const batch of batches) {
            console.log(`Processando lote...`);

            for (const username of batch) {
                try {

                    console.log("TESTESESSION, linha 19: ", username);
                    const userInfo = await session.user.searchExact(username.trim().toLowerCase());

                    const instaResponse = await session.friendship.create(`${userInfo.pk}`);
                    console.log(`Seguindo usuário ${username} (ID: ${userInfo.pk}) - Resposta:`, instaResponse);

                    await sleep(randomDelay(4000, 7000));
                }
                catch (error) {

                    console.log("ERRO NA AÇÃO DO SERVIÇO: ", error.message);
                    if (["challenge_required", "feedback_required", "login_required", "We can send you an email to help you get back into your account"].some(err => error.message.includes(err))) {

                        return {
                            status: 200,
                            message: `Autorização ou Captcha solicitado pelo Instagram, Tentaremos recarregar os acessos! Erro: ${error.message}`,
                            username: account
                        }
                    }

                    console.log("ERRO: ", error)
                }
            }
        }

        console.log("Todos os lotes foram processados com sucesso.");
        const result = "Usúarios adicionados com sucesso"

        return res.status(200).send({
            message: result
        });
    }
    else {

        try {

            const batches = [];
            for (let i = 0; i < usernames.length; i += batchSize) {
                batches.push(usernames.slice(i, i + batchSize));
            }

            console.log(`Usuários divididos em ${batches.length} lotes de até ${batchSize} usuários.`);

            for (const batch of batches) {

                console.log(`Processando lote...`);

                for (const username of batch) {
                    try {
                        const userInfo = await session.user.searchExact(username);

                        const instaResponse = await session.friendship.destroy(`${userInfo.pk}`);
                        console.log(`Deixando de seguir usuário ${username} (ID: ${userInfo.pk}) - Resposta:`, instaResponse);

                        await sleep(randomDelay(4000, 7000));

                    } catch (error) {

                        console.log("ERRO NA AÇÃO DO SERVIÇO: ", error.message);
                        if (["challenge_required", "feedback_required", "login_required", "We can send you an email to help you get back into your account"].some(err => error.message.includes(err))) {

                            return {
                                status: 200,
                                message: `Autorização ou Captcha solicitado pelo Instagram, Tentaremos recarregar os acessos! Erro: ${error.message}`,
                                username: account
                            }
                        }
                    }
                }
            }
            console.log("Todos os lotes foram processados com sucesso.");
            const result = "Usúarios removidos com sucesso"

            return res.status(200).send({
                message: result
            });
        }
        catch (error) {

            console.log("ERRO NA AÇÃO DO SERVIÇO: ", error.message);
            if (["challenge_required", "feedback_required", "login_required", "We can send you an email to help you get back into your account"].some(err => error.message.includes(err))) {

                return { status: 200, message: "Autorização ou Captcha solicitado pelo Instagram, Tentaremos recarregar os acessos" }
            }
        }
    }
}
exports.uploadUsersListTxtService = async (req, res) => {

    const file = req.file;
    const { userId, account } = req.params;
    const { batchSize, actionValue } = req.body

    const user = await User.findById(userId);
    const ig = new IgApiClient();

    await ig.state.generateDevice(user.username);
    const session = await loadSessionFromDB(userId, account, ig);

    let usernames = [];
    if (file != undefined) {

      const filePath = path.join(__dirname, '../uploads', file.filename);

      const readIdsFromFile = () => {
        const data = fs.readFileSync(filePath, 'utf-8');
        return data.split('\n').map((id) => id.trim()).filter((id) => id);
      };

      const usernamesList = readIdsFromFile();
      console.log("USERIDS: ", usernamesList)

      usernames = usernamesList;
    }

    if (actionValue == "Seguir") {

        const batches = [];
        for (let i = 0; i < usernames.length; i += batchSize) {
            batches.push(usernames.slice(i, i + batchSize));
        }

        console.log(`Usuários divididos em ${batches.length} lotes de até ${batchSize} usuários.`);

        console.log("usernames", usernames)

        for (const batch of batches) {
            console.log(`Processando lote...`);

            for (const username of batch) {
                try {

                    console.log("TESTESESSION, linha 19: ", username);
                    const userInfo = await session.user.searchExact(username.trim().toLowerCase());

                    const instaResponse = await session.friendship.create(`${userInfo.pk}`);
                    console.log(`Seguindo usuário ${username} (ID: ${userInfo.pk}) - Resposta:`, instaResponse);

                    await sleep(randomDelay(4000, 7000));
                }
                catch (error) {

                    console.log("ERRO NA AÇÃO DO SERVIÇO: ", error.message);
                    if (["challenge_required", "feedback_required", "login_required", "We can send you an email to help you get back into your account"].some(err => error.message.includes(err))) {

                        return {
                            status: 200,
                            message: `Autorização ou Captcha solicitado pelo Instagram, Tentaremos recarregar os acessos! Erro: ${error.message}`,
                            username: account
                        }
                    }

                    console.log("ERRO: ", error)
                }
            }
        }

        console.log("Todos os lotes foram processados com sucesso.");
        const result = "Usúarios adicionados com sucesso"

        return res.status(200).send({
            message: result
        });
    }
    else {

        try {

            const batches = [];
            for (let i = 0; i < usernames.length; i += batchSize) {
                batches.push(usernames.slice(i, i + batchSize));
            }

            console.log(`Usuários divididos em ${batches.length} lotes de até ${batchSize} usuários.`);

            for (const batch of batches) {

                console.log(`Processando lote...`);

                for (const username of batch) {
                    try {
                        const userInfo = await session.user.searchExact(username);

                        const instaResponse = await session.friendship.destroy(`${userInfo.pk}`);
                        console.log(`Deixando de seguir usuário ${username} (ID: ${userInfo.pk}) - Resposta:`, instaResponse);

                        await sleep(randomDelay(4000, 7000));

                    } catch (error) {

                        console.log("ERRO NA AÇÃO DO SERVIÇO: ", error.message);
                        if (["challenge_required", "feedback_required", "login_required", "We can send you an email to help you get back into your account"].some(err => error.message.includes(err))) {

                            return {
                                status: 200,
                                message: `Autorização ou Captcha solicitado pelo Instagram, Tentaremos recarregar os acessos! Erro: ${error.message}`,
                                username: account
                            }
                        }
                    }
                }
            }
            console.log("Todos os lotes foram processados com sucesso.");
            const result = "Usúarios removidos com sucesso"

            return res.status(200).send({
                message: result
            });
        }
        catch (error) {

            console.log("ERRO NA AÇÃO DO SERVIÇO: ", error.message);
            if (["challenge_required", "feedback_required", "login_required", "We can send you an email to help you get back into your account"].some(err => error.message.includes(err))) {

                return { status: 200, message: "Autorização ou Captcha solicitado pelo Instagram, Tentaremos recarregar os acessos" }
            }
        }
    }
};

exports.uploadListToLikePostsService = async (req, res) => {

    const { userId, account } = req.params;
    const { targets, likeAction, commentsLimit } = req.body

    const user = await User.findById(userId);
    const ig = new IgApiClient();

    await ig.state.generateDevice(user.username);
    const session = await loadSessionFromDB(userId, account, ig);

    if (likeAction === 'followers') {

        try {

            if (!Array.isArray(targets)) {
                let usernames = targets.split(" ");
            }

            for (const username of targets) {
                try {
                    if (typeof username !== "string") {

                        throw new Error(`Valor inválido no array de usernames: ${username}`);
                    }

                    const userInfo = await session.user.searchExact(username.trim().toLowerCase());
                    if (!userInfo) {

                        throw new Error("Informação do usúario não foi encontrada!")
                    }

                    const userFeed = session.feed.user(userInfo.pk);
                    const posts = await userFeed.items();
                    const firstTenPosts = posts.slice(0, commentsLimit);

                    for (const post of firstTenPosts) {

                        console.log(`Curtindo a publicação ${post.id}, de code: ${post.code}`);
                        await session.media.like({ mediaId: post.id, moduleInfo: { module_name: "profile" } });
                        await sleep(randomDelay(4000, 7000));
                    }
                }
                catch (error) {

                    console.log("ERRO NA AÇÃO DO SERVIÇO: ", error.message);
                    if (["challenge_required", "feedback_required", "login_required", "We can send you an email to help you get back into your account"].some(err => error.message.includes(err))) {

                        return {
                            status: 200,
                            message: `Autorização ou Captcha solicitado pelo Instagram, Tentaremos recarregar os acessos! Erro: ${error.message}`,
                            username: account
                        }
                    }
                }
            }

            console.log("Todos os lotes foram processados com sucesso.");
            const result = "Curtidas adiciondas com sucesso!";

            return res.status(200).send({
                message: result
            });
        }
        catch (error) {

            console.log("ERRO NA AÇÃO DO SERVIÇO: ", error.message);
            if (["challenge_required", "feedback_required", "login_required", "We can send you an email to help you get back into your account"].some(err => error.message.includes(err))) {

                return {
                    status: 200,
                    message: "Autorização ou Captcha solicitado pelo Instagram, Tentaremos recarregar os acessos",
                    username: account
                }
            }
        }
    }
    else if (likeAction === 'hashtags') {

        try {

            if (!Array.isArray(targets) || targets.length === 0) {
                throw new Error("A lista de hashtags deve ser um array não vazio.");
            }

            for (const hashtag of targets) {
                try {
                    const tagFeed = session.feed.tags(hashtag.trim().toLowerCase(), "recent");
                    const posts = await tagFeed.items();
                    const firstFifteenPosts = posts.slice(0, commentsLimit);

                    for (const post of firstFifteenPosts) {
                        console.log(`Curtindo a publicação da hashtag #${hashtag}, de code: ${post.code}`);
                        await session.media.like({ mediaId: post.id, moduleInfo: { module_name: "feed_contextual_hashtag" } });
                        await sleep(randomDelay(4000, 7000));
                    }
                } catch (error) {

                    console.log("ERRO NA AÇÃO DO SERVIÇO: ", error.message);
                    if (["challenge_required", "feedback_required", "login_required", "We can send you an email to help you get back into your account"].some(err => error.message.includes(err))) {

                        return { status: 200, message: "Autorização ou Captcha solicitado pelo Instagram, Tentaremos recarregar os acessos" }
                    }
                }
            }

            console.log("Todos os lotes foram processados com sucesso.");
            const result = "Curtidas adiciondas com sucesso!";

            return res.status(200).send({
                message: result
            });

        } catch (error) {

            console.log("ERRO NA AÇÃO DO SERVIÇO: ", error.message);
            if (["challenge_required", "feedback_required", "login_required", "We can send you an email to help you get back into your account"].some(err => error.message.includes(err))) {

                return { status: 200, message: "Autorização ou Captcha solicitado pelo Instagram, Tentaremos recarregar os acessos" }
            }
        }

    }
    else if (likeAction === 'location') {

        try {

            if (!Array.isArray(targets) || targets.length === 0) {
                throw new Error("A lista de localizações deve ser um array não vazio.");
            }

            for (const locationName of targets) {
                try {
                    const locationId = await getLocationIdByName(locationName, session);
                    const locationFeed = session.feed.location(locationId);
                    const posts = await locationFeed.items();
                    const firstFifteenPosts = posts.slice(0, commentsLimit);

                    for (const post of firstFifteenPosts) {
                        console.log(`Curtindo a publicação da localização ${locationName}, de code: ${post.code}`);
                        await session.media.like({ mediaId: post.id, moduleInfo: { module_name: "location" } });
                        await sleep(randomDelay(4000, 7000));
                    }
                } catch (error) {

                    console.log("ERRO NA AÇÃO DO SERVIÇO: ", error.message);
                    if (["challenge_required", "feedback_required", "login_required", "We can send you an email to help you get back into your account"].some(err => error.message.includes(err))) {

                        return { status: 200, message: "Autorização ou Captcha solicitado pelo Instagram, Tentaremos recarregar os acessos" }
                    }
                }
            }

            console.log("Curtidas adiciondas com sucesso!");
            return "Curtidas adiciondas com sucesso!";
        } catch (error) {

            console.log("ERRO NA AÇÃO DO SERVIÇO: ", error.message);
            if (["challenge_required", "feedback_required", "login_required", "We can send you an email to help you get back into your account"].some(err => error.message.includes(err))) {

                return { status: 200, message: "Autorização ou Captcha solicitado pelo Instagram, Tentaremos recarregar os acessos" }
            }
        }
    }
};

const getLocationIdByName = async (locationName, session) => {
    try {
        const searchResults = await session.locationSearch.index({ query: locationName });

        if (searchResults.venues.length === 0) {
            throw new Error(`Nenhuma localização encontrada com o nome: ${locationName}`);
        }

        return searchResults.venues[0].external_id;
    }
    catch (error) {

        console.error(`Erro ao buscar ID para a localização ${locationName}:`, error.message);
        throw error;
    }
};

exports.uploadListToLikePostsFileService = async (req, res) => {

    const file = req.file;
    const { userId, account } = req.params;
    const { likeAction, commentsLimit } = req.body

    const filePath = path.join(__dirname, '../../backend/uploads', file.filename);

    const readIdsFromFile = () => {
        const data = fs.readFileSync(filePath, 'utf-8');
        return data.split('\n').map((id) => id.trim()).filter((id) => id);
    };

    const targets = readIdsFromFile();
    console.log("USERIDS: ", targets);

    const targetList = targets;

    const user = await User.findById(userId);
    const ig = new IgApiClient();

    await ig.state.generateDevice(user.username);
    const session = await loadSessionFromDB(userId, account, ig);

    if (likeAction === 'followers') {

        try {

            if (!Array.isArray(targets)) {
                let usernames = targets.split(" ");
            }

            for (const username of targets) {
                try {
                    if (typeof username !== "string") {

                        throw new Error(`Valor inválido no array de usernames: ${username}`);
                    }

                    const userInfo = await session.user.searchExact(username.trim().toLowerCase());
                    if (!userInfo) {

                        throw new Error("Informação do usúario não foi encontrada!")
                    }

                    const userFeed = session.feed.user(userInfo.pk);
                    const posts = await userFeed.items();
                    const firstTenPosts = posts.slice(0, commentsLimit);

                    for (const post of firstTenPosts) {

                        console.log(`Curtindo a publicação ${post.id}, de code: ${post.code}`);
                        await session.media.like({ mediaId: post.id, moduleInfo: { module_name: "profile" } });
                        await sleep(randomDelay(4000, 7000));
                    }
                }
                catch (error) {

                    console.log("ERRO NA AÇÃO DO SERVIÇO: ", error.message);
                    if (["challenge_required", "feedback_required", "login_required", "We can send you an email to help you get back into your account"].some(err => error.message.includes(err))) {

                        return {
                            status: 200,
                            message: `Autorização ou Captcha solicitado pelo Instagram, Tentaremos recarregar os acessos! Erro: ${error.message}`,
                            username: account
                        }
                    }
                }
            }

            console.log("Todos os lotes foram processados com sucesso.");
            const result = "Curtidas adiciondas com sucesso!";

            return res.status(200).send({
                message: result
            });
        }
        catch (error) {

            console.log("ERRO NA AÇÃO DO SERVIÇO: ", error.message);
            if (["challenge_required", "feedback_required", "login_required", "We can send you an email to help you get back into your account"].some(err => error.message.includes(err))) {

                return {
                    status: 200,
                    message: "Autorização ou Captcha solicitado pelo Instagram, Tentaremos recarregar os acessos",
                    username: account
                }
            }
        }
    }
    else if (likeAction === 'hashtags') {

        try {

            if (!Array.isArray(targets) || targets.length === 0) {
                throw new Error("A lista de hashtags deve ser um array não vazio.");
            }

            for (const hashtag of targets) {
                try {
                    const tagFeed = session.feed.tags(hashtag.trim().toLowerCase(), "recent");
                    const posts = await tagFeed.items();
                    const firstFifteenPosts = posts.slice(0, commentsLimit);

                    for (const post of firstFifteenPosts) {
                        console.log(`Curtindo a publicação da hashtag #${hashtag}, de code: ${post.code}`);
                        await session.media.like({ mediaId: post.id, moduleInfo: { module_name: "feed_contextual_hashtag" } });
                        await sleep(randomDelay(4000, 7000));
                    }
                } catch (error) {

                    console.log("ERRO NA AÇÃO DO SERVIÇO: ", error.message);
                    if (["challenge_required", "feedback_required", "login_required", "We can send you an email to help you get back into your account"].some(err => error.message.includes(err))) {

                        return { status: 200, message: "Autorização ou Captcha solicitado pelo Instagram, Tentaremos recarregar os acessos" }
                    }
                }
            }

            console.log("Todos os lotes foram processados com sucesso.");
            const result = "Curtidas adiciondas com sucesso!";

            return res.status(200).send({
                message: result
            });

        } catch (error) {

            console.log("ERRO NA AÇÃO DO SERVIÇO: ", error.message);
            if (["challenge_required", "feedback_required", "login_required", "We can send you an email to help you get back into your account"].some(err => error.message.includes(err))) {

                return { status: 200, message: "Autorização ou Captcha solicitado pelo Instagram, Tentaremos recarregar os acessos" }
            }
        }

    }
    else if (likeAction === 'location') {

        try {

            if (!Array.isArray(targets) || targets.length === 0) {
                throw new Error("A lista de localizações deve ser um array não vazio.");
            }

            for (const locationName of targets) {
                try {
                    const locationId = await getLocationIdByName(locationName, session);
                    const locationFeed = session.feed.location(locationId);
                    const posts = await locationFeed.items();
                    const firstFifteenPosts = posts.slice(0, commentsLimit);

                    for (const post of firstFifteenPosts) {
                        console.log(`Curtindo a publicação da localização ${locationName}, de code: ${post.code}`);
                        await session.media.like({ mediaId: post.id, moduleInfo: { module_name: "location" } });
                        await sleep(randomDelay(4000, 7000));
                    }
                } catch (error) {

                    console.log("ERRO NA AÇÃO DO SERVIÇO: ", error.message);
                    if (["challenge_required", "feedback_required", "login_required", "We can send you an email to help you get back into your account"].some(err => error.message.includes(err))) {

                        return { status: 200, message: "Autorização ou Captcha solicitado pelo Instagram, Tentaremos recarregar os acessos" }
                    }
                }
            }

            console.log("Curtidas adiciondas com sucesso!");
            return "Curtidas adiciondas com sucesso!";
        } catch (error) {

            console.log("ERRO NA AÇÃO DO SERVIÇO: ", error.message);
            if (["challenge_required", "feedback_required", "login_required", "We can send you an email to help you get back into your account"].some(err => error.message.includes(err))) {

                return { status: 200, message: "Autorização ou Captcha solicitado pelo Instagram, Tentaremos recarregar os acessos" }
            }
        }
    }
};

// Curtidas em Comentários
exports.uploadLikesToCommentsService = async (req, res) => {

    const { userId, account } = req.params;
    const { filterType, filterInput, commentsLimit, postsLimit, } = req.body

    const user = await User.findById(userId);
    const ig = new IgApiClient();

    await ig.state.generateDevice(user.username);
    const session = await loadSessionFromDB(userId, account, ig);

    try {
        let posts = [];

        if (filterType === "user") {

            const usernames = filterInput.split(",").map((username) => username.trim());
            console.log(`Buscando publicações dos usuários: ${usernames}`);

            for (const username of usernames) {
                try {

                    const userInfo = await session.user.searchExact(username);
                    await sleep(randomDelay(3000, 7000));

                    const userFeed = session.feed.user(userInfo.pk);
                    await sleep(randomDelay(2000, 5000));

                    const userPosts = await userFeed.items();
                    posts = posts.concat(userPosts);
                }
                catch (error) {

                    console.log("ERRO NA AÇÃO DO SERVIÇO: ", error.message);
                    if (error.message.includes("challenge_required", "feedback_required", "login_required", "We can send you an email to help you get back into your account")) {

                        return {
                            status: 200,
                            message: `Autorização ou Captcha solicitado pelo Instagram, Tentaremos recarregar os acessos! Erro: ${error.message}`,
                            username: account
                        }
                    }
                }
            }
        }
        else if (filterType === "hashtag") {
            console.log(`Buscando publicações para a hashtag: ${filterInput}`);
            const tagFeed = session.feed.tags(filterInput.trim().toLowerCase(), "recent");
            posts = await tagFeed.items();
        }
        else if (filterType === "location") {
            console.log(`Buscando publicações para a localização: ${filterInput}`);
            const searchResults = await session.locationSearch.index({ query: filterInput });
            const location = searchResults.venues[0];
            if (!location) throw new Error(`Localização ${filterInput} não encontrada.`);
            const locationFeed = session.feed.location(location.external_id);
            posts = await locationFeed.items();

        }
        else {

            throw new Error("Tipo de filtro inválido.");
        }

        for (const post of posts.slice(0, postsLimit)) {

            console.log(`Buscando comentários na publicação: ${post.id}, e code: ${post.code}`);
            const commentsFeed = session.feed.mediaComments(post.id);
            await sleep(randomDelay(3000, 6000));

            const comments = await commentsFeed.items();
            await sleep(randomDelay(3000, 8000));

            for (const comment of comments.slice(0, commentsLimit)) {

                try {

                    console.log(`Curtindo comentário ${comment.pk} na publicação ${post.id} e code: ${post.code}`);
                    await session.media.likeComment(comment.pk);

                    await sleep(randomDelay(4000, 7000));
                }
                catch (error) {

                    console.log("ERRO NA AÇÃO DO SERVIÇO: ", error.message);
                    if (["challenge_required", "feedback_required", "login_required", "We can send you an email to help you get back into your account"].some(err => error.message.includes(err))) {

                        return { status: 200, message: "Autorização ou Captcha solicitado pelo Instagram, Tentaremos recarregar os acessos" }
                    }
                }
            }
        }

        console.log("Curtidas em comentários concluídas.");
        const result = "Curtidas em comentários concluídas com sucesso!";

        return res.status(200).send({
            message: result
        });
    }
    catch (error) {

        console.log("ERRO NA AÇÃO DO SERVIÇO: ", error.message);
        if (["challenge_required", "feedback_required", "login_required", "We can send you an email to help you get back into your account"].some(err => error.message.includes(err))) {

            return { status: 200, message: "Autorização ou Captcha solicitado pelo Instagram, Tentaremos recarregar os acessos" }
        }
    }
};

// Comentários em publicações
exports.uploadPostsCommentariesService = async (req, res) => {

    const { userId, account } = req.params;
    const { hashtags, commentText, postsLimit } = req.body

    const user = await User.findById(userId);
    const ig = new IgApiClient();

    await ig.state.generateDevice(user.username);
    const session = await loadSessionFromDB(userId, account, ig);

    try {

        validateInput(hashtags, commentText);

        for (const hashtag of hashtags) {
            if (typeof hashtag !== 'string') {
                console.error(`Valor inválido na lista de hashtags: ${hashtag}`);
                continue;
            }

            console.log(`Buscando publicações para a hashtag: ${hashtag}`);
            const tagFeed = session.feed.tags(hashtag.trim().toLowerCase(), 'recent');
            await sleep(randomDelay(2000, 5000));

            const posts = (await tagFeed.items()).slice(0, postsLimit);
            await sleep(randomDelay(1000, 3000));

            await commentOnPosts(session, posts, hashtag, commentText);
            const result = "Comentários concluídos com sucesso!";

            return res.status(200).send({
                message: result
            });
        }
    }
    catch (error) {

        if (error.message.includes("challenge_required", "feedback_required", "login_required", "We can send you an email to help you get back into your account")) {

            return { status: 200, message: "Autorização ou Captcha solicitado pelo Instagram, Tentaremos recarregar os acessos" }
        }
    }
};

const validateInput = (hashtags, commentText) => {
    if (!Array.isArray(hashtags) || hashtags.length === 0) {
        throw new Error('A lista de hashtags deve ser um array não vazio.');
    }
    if (typeof commentText !== 'string' || commentText.trim() === '') {
        throw new Error('O texto do comentário deve ser uma string não vazia.');
    }
};

const commentOnPosts = async (session, posts, hashtag, commentText) => {
    console.log(`Comentando nas primeiras ${posts.length} publicações da hashtag #${hashtag}...`);

    for (const post of posts) {
        try {
            console.log('Código post:', post.code);
            const instaResponse = await session.media.comment({ mediaId: post.id, text: commentText.trim() });
            console.log(`Comentário enviado na publicação ${post.id}, de code: ${post.code} da hashtag #${hashtag}.`);

            await sleep(randomDelay(4000, 8000));

        } catch (error) {

            console.log("ERRO NA AÇÃO DO SERVIÇO: ", error.message);

            if (["challenge_required", "feedback_required", "login_required", "We can send you an email to help you get back into your account"].some(err => error.message.includes(err))) {

                return {
                    status: 200,
                    message: `Autorização ou Captcha solicitado pelo Instagram, Tentaremos recarregar os acessos! Erro: ${error.message}`
                }
            }
        }
    }
};

// Visualização em stories
exports.uploadUsersToViewAndLikeStoriesService = async (req, res) => {

    const { userId, account } = req.params;
    const { profileList } = req.body

    const user = await User.findById(userId);
    const ig = new IgApiClient();

    await ig.state.generateDevice(user.username);
    const session = await loadSessionFromDB(userId, account, ig);

    try {

        for (const profile of profileList) {

            console.log(`Processando perfil: ${profile.pk}`);
            const userInfo = await session.user.searchExact(profile.trim().toLowerCase());

            if (!userInfo || !userInfo.pk) {

                console.error(`Usuário não encontrado ou pk inválido: ${profile.pk}`);
            }

            const storiesFeed = session.feed.reelsMedia({ userIds: [userInfo.pk] });
            await sleep(randomDelay(1000, 2000));

            const stories = await storiesFeed.items();
            await sleep(randomDelay(1000, 2000));

            console.log(`Stories encontrados para ${profile}:`, stories.length);

            if (!stories.length) {

                console.log(`Nenhum story encontrado para o perfil: ${profile.pk}`);
            }

            for (const story of stories) {
                try {

                    if (!story.id || typeof story.taken_at === 'undefined') {

                        console.error(`Story sem ID ou taken_at válido:`, story.id);
                    }

                    await session.story.seen([{
                        id: story.id,
                        taken_at: story.taken_at,
                        user: { pk: userInfo.pk }
                    }]);

                    console.log(`Story visualizado: ${story.id} do perfil ${profile}`);
                }
                catch (error) {

                    console.error(`Erro ao processar o story ${story.id}:`, error.message);

                    console.log("ERRO NA AÇÃO DO SERVIÇO: ", error.message);
                    if (["challenge_required", "feedback_required", "login_required", "We can send you an email to help you get back into your account"].some(err => error.message.includes(err))) {

                        return {
                            status: 200,
                            message: `Autorização ou Captcha solicitado pelo Instagram, Tentaremos recarregar os acessos! Erro: ${error.message}`,
                            username: account
                        }
                    }
                }
            }

        }

        const result = "Stories visualizados com sucesso!";
        return res.status(200).send({
            message: result
        });
    }
    catch (error) {

        if (error.message.includes("challenge_required", "feedback_required", "login_required", "We can send you an email to help you get back into your account")) {

            return { status: 200, message: "Autorização ou Captcha solicitado pelo Instagram, Tentaremos recarregar os acessos" }
        }
    }
};
exports.uploadUsersToViewAndLikeStoriesFileService = async (req, res) => {

    const file = req.file;
    const { userId, account } = req.params;

    let profileList;
    if (file) {

        const filePath = path.join(__dirname, '../../backend/uploads', file.filename);

        const readIdsFromFile = () => {
            const data = fs.readFileSync(filePath, 'utf-8');
            return data.split('\n').map((id) => id.trim()).filter((id) => id);
        };

        const usernames = readIdsFromFile();
        console.log("USERIDS: ", usernames);

        profileList = usernames;
    }

    const user = await User.findById(userId);
    const ig = new IgApiClient();

    await ig.state.generateDevice(user.username);
    const session = await loadSessionFromDB(userId, account, ig);

    try {

        for (const profile of profileList) {

            try {
                console.log(`Processando perfil: ${profile}`);
                const userInfo = await session.user.searchExact(profile.trim().toLowerCase());

                if (!userInfo || !userInfo.pk) {

                    console.error(`Usuário não encontrado ou pk inválido: ${profile}`);
                }

                const storiesFeed = session.feed.reelsMedia({ userIds: [userInfo.pk] });
                await sleep(randomDelay(1000, 3000));

                const stories = await storiesFeed.items();
                await sleep(randomDelay(2000, 4000));

                console.log(`Stories encontrados para ${profile}:`, stories.length);
                console.log(`Estrutura dos stories recebidos:`, JSON.stringify(stories, null, 2));

                if (!stories.length) {

                    console.log(`Nenhum story encontrado para o perfil: ${profile}`);
                }

                for (const story of stories) {
                    try {

                        if (!story.id || typeof story.taken_at === 'undefined') {

                            console.error(`Story sem ID ou taken_at válido:`, story);
                        }

                        await session.story.seen([{
                            id: story.id,
                            taken_at: story.taken_at,
                            user: { pk: userInfo.pk }
                        }]);

                        console.log(`Story visualizado: ${story.id} do perfil ${profile}`);
                        await sleep(randomDelay(3000, 6000));

                    }
                    catch (error) {

                        console.error(`Erro ao processar o story ${story.id}:`, error.message);

                        console.log("ERRO NA AÇÃO DO SERVIÇO: ", error.message);
                        if (["challenge_required", "feedback_required", "login_required", "We can send you an email to help you get back into your account"].some(err => error.message.includes(err))) {

                            return {
                                status: 200,
                                message: `Autorização ou Captcha solicitado pelo Instagram, Tentaremos recarregar os acessos! Erro: ${error.message}`,
                                username: account
                            }
                        }
                    }
                }
            }
            catch (error) {

                console.log("ERRO NA AÇÃO DO SERVIÇO: ", error.message);
                if (["challenge_required", "feedback_required", "login_required", "We can send you an email to help you get back into your account"].some(err => error.message.includes(err))) {

                    return {
                        status: 200,
                        message: `Autorização ou Captcha solicitado pelo Instagram, Tentaremos recarregar os acessos! Erro: ${error.message}`,
                        username: account
                    }
                }
            }
        }

        const result = "Stories visualizados com sucesso!";
        return res.status(200).send({
            message: result
        });
    }
    catch (error) {

        if (error.message.includes("challenge_required", "feedback_required", "login_required", "We can send you an email to help you get back into your account")) {

            return { status: 200, message: "Autorização ou Captcha solicitado pelo Instagram, Tentaremos recarregar os acessos" }
        }
    }
};



exports.createFeedPostService = async (req, res) => {

    const mediaPath = req.file.path;
    const { userId, account } = req.params;
    const { caption } = req.body

    const user = await User.findById(userId);
    const ig = new IgApiClient();

    await ig.state.generateDevice(user.username);
    const session = await loadSessionFromDB(userId, account, ig);

    try {

        const file = fs.readFileSync(mediaPath);
        const fileType = mediaPath.split('.').pop().toLowerCase();

        let publishResult;
        if (['mp4', 'mov', 'avi'].includes(fileType)) {

            const coverImagePath = path.resolve(__dirname, '../uploads/zzz.png');
            const coverImageBuffer = fs.readFileSync(coverImagePath);

            publishResult = await session.publish.video({
                video: file,
                coverImage: coverImageBuffer,
                caption,
            });
        }
        else {
            publishResult = await session.publish.photo({
                file,
                caption,
            });
        }

        fs.unlinkSync(mediaPath);

        if (publishResult && publishResult.status === 'ok') {

            const result = 'Publicação criada com sucesso!';
            return res.status(200).send({
                message: result
            });
        }
        else {

            console.log("ERRO NA AÇÃO DO SERVIÇO: ", error.message);
            if (["challenge_required", "feedback_required", "login_required", "We can send you an email to help you get back into your account"].some(err => error.message.includes(err))) {

                return {
                    status: 200,
                    message: `Autorização ou Captcha solicitado pelo Instagram, Tentaremos recarregar os acessos! Erro: ${error.message}`,
                    username: account
                }
            }
        }

    }
    catch (error) {

        console.log("ERRO NA AÇÃO DO SERVIÇO: ", error.message);
        if (["challenge_required", "feedback_required", "login_required", "We can send you an email to help you get back into your account"].some(err => error.message.includes(err))) {

            return { status: 200, message: "Autorização ou Captcha solicitado pelo Instagram, Tentaremos recarregar os acessos" }
        }
    }
};

exports.createStoryPostService = async (req, res) => {

    const mediaPath = req.file.path;
    const { userId, account } = req.params;
    const { caption, hashtags, music } = req.body;

    const user = await User.findById(userId);
    const ig = new IgApiClient();

    await ig.state.generateDevice(user.username);
    const session = await loadSessionFromDB(userId, account, ig);

    try {

        if (!fs.existsSync(mediaPath)) {
            throw new Error('O arquivo especificado não existe.');
        }

        const file = fs.readFileSync(mediaPath);
        const captionText = caption

        const formattedHashtags = Array.isArray(hashtags)
        ? hashtags.map(tag => ({
            tag_name: tag,
            x: 0.5,
            y: 0.5,
            width: 0.5,
            height: 0.1,
            rotation: 0.0,
          }))
        : [];
      
      const musicSticker = music
        ? {
            song_name: music,
            x: 0.5,
            y: 0.5,
          }
        : undefined;

        const fileType = mediaPath.split('.').pop().toLowerCase();
        const publishOptions = {
            hashtags: formattedHashtags,
            music_sticker: musicSticker,
        };

        let publishResult;
        if (['mp4', 'mov', 'avi'].includes(fileType)) {

            const coverImagePath = path.resolve(__dirname, 'c://uploads/commonCover.png');
            const coverImageBuffer = fs.readFileSync(coverImagePath);
            
            publishResult = await session.publish.story({
                video: file,
                coverImage: coverImageBuffer,
                ...publishOptions,
            });
        }
        else {

            console.log("CAPTION: ", typeof caption, caption)
            publishResult = await session.publish.story({
                file,
                captionText,
                ...publishOptions,
            });
        }

        fs.unlinkSync(mediaPath);

        if (publishResult && publishResult.status === 'ok') {

            const result = 'Story criado com sucesso!';
            return res.status(200).send({
                message: result
            });
        }
        else {

            console.log("ERRO NA AÇÃO DO SERVIÇO: ", error.message);
            if (["challenge_required", "feedback_required", "login_required", "We can send you an email to help you get back into your account"].some(err => error.message.includes(err))) {

                return {
                    status: 200,
                    message: `Autorização ou Captcha solicitado pelo Instagram, Tentaremos recarregar os acessos! Erro: ${error.message}`,
                    username: account
                }
            }
        }
    }
    catch (error) {

        console.log("ERRO NA AÇÃO DO SERVIÇO: ", error.message);
        if (["challenge_required", "feedback_required", "login_required", "We can send you an email to help you get back into your account"].some(err => error.message.includes(err))) {

            return { status: 200, message: "Autorização ou Captcha solicitado pelo Instagram, Tentaremos recarregar os acessos" }
        }
    }
};

exports.createReelsPostService = async (req, res) => {

    const media = req.file;
    const { userId, account } = req.params;
    const { caption, hashtags, music, location } = req.body

    const user = await User.findById(userId);
    const ig = new IgApiClient();

    await ig.state.generateDevice(user.username);
    const session = await loadSessionFromDB(userId, account, ig);

    try {

        console.log('Teste ok')
        // Verifica se o arquivo de mídia foi enviado
        if (!req.file || !req.file.path) {
            return res.status(400).send({
                message: 'Mídia é obrigatória para criar um Reels.'
            });
        }

        // Extrai os dados do corpo da requisição
        const { caption, hashtags, music, location, user, account } = req.body;

        if (!caption || caption.trim() === '') {
            return res.status(400).send({
                message: 'Legenda é obrigatória.'
            });
        }

        console.log('Dados recebidos para criação de Reels:', {
            caption,
            hashtags,
            music,
            location,
            mediaPath: req.file.path,
            user,
        });

        // Chama o serviço para criar o Reels
        const result = await createReelsPostService(user, account, req.file.path, caption, hashtags, music, location);

        res.status(200).send({
            message: 'Reels criado com sucesso!',
            data: result
        });
    }
    catch (error) {
        console.error('Erro ao criar o Reels:', error.message);
        res.status(500).send({
            message: 'Erro ao criar o Reels.',
            error: error.message
        });
    }
};
