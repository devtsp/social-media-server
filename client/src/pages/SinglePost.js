import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gql, useQuery, useMutation } from '@apollo/client';
import {
	Card,
	Grid,
	Image,
	Button,
	Icon,
	Label,
	Form,
} from 'semantic-ui-react';

import { AuthContext } from '../context/auth';
import { timePassed } from '../utils/time-passed';
import LikeButton from '../components/LikeButton';
import DeleteButton from '../components/DeleteButton';

const SinglePost = () => {
	const navigate = useNavigate();
	const { postId } = useParams();
	const { user } = React.useContext(AuthContext);
	const [comment, setComment] = React.useState('');

	const { loading, data } = useQuery(FETCH_POST_QUERY, {
		variables: {
			postId,
		},
	});

	const [submitComment] = useMutation(SUBMIT_COMMENT_MUTATION, {
		update(proxy, result) {
			setComment('');
		},
		variables: {
			postId,
			body: comment,
		},
	});

	function deletePostCallback() {
		navigate('/');
	}

	let postMarkup;

	if (loading) {
		postMarkup = <p>Loading Post..</p>;
	} else {
		const { id, body, createdAt, username, comments, likes } = data.getPost;

		postMarkup = (
			<Grid>
				<Grid.Row>
					<Grid.Column width={2}>
						<Image
							src="https://react.semantic-ui.com/images/avatar/large/molly.png"
							size="small"
							float="right"
						/>
					</Grid.Column>
					<Grid.Column width={10}>
						<Card fluid>
							<Card.Content>
								<Card.Header>{username}</Card.Header>
								<Card.Meta>{timePassed(createdAt)}</Card.Meta>
								<Card.Description>{body}</Card.Description>
							</Card.Content>
							<hr />
							<Card.Content extra>
								<LikeButton user={user} post={{ id, likes }} />
								<Button
									as="div"
									labelPosition="right"
									onClick={() => console.log('asdas')}
								>
									<Button basic color="blue">
										<Icon name="comments"> </Icon>
									</Button>
									<Label basic color="blue" pointing="left">
										{comments.length}
									</Label>
								</Button>
								{user && user.username === username && (
									<DeleteButton postId={id} callback={deletePostCallback} />
								)}
							</Card.Content>
						</Card>
						{user && (
							<Card fluid>
								<Card.Content>
									<p>Post a comment</p>
									<Form>
										<div className="ui action input fluid">
											<input
												type="text"
												placeholder="Comment.."
												name="comment"
												value={comment}
												onChange={e => setComment(e.target.value)}
											/>
										</div>
										<button
											type="submit"
											className="ui button teal"
											disabled={comment.trim() === ''}
											onClick={submitComment}
										>
											Submit
										</button>
									</Form>
								</Card.Content>
							</Card>
						)}
						{comments.map(comment => (
							<Card fluid key={comment.id}>
								<Card.Content>
									{user && user.username === comment.username && (
										<DeleteButton postId={id} commentId={comment.id} />
									)}
									<Card.Header>{comment.username}</Card.Header>
									<Card.Meta>{timePassed(createdAt)}</Card.Meta>
									<Card.Description>{comment.body}</Card.Description>
								</Card.Content>
							</Card>
						))}
					</Grid.Column>
				</Grid.Row>
			</Grid>
		);
	}
	return postMarkup;
};

const SUBMIT_COMMENT_MUTATION = gql`
	mutation ($postId: ID!, $body: String!) {
		createComment(postId: $postId, body: $body) {
			id
			comments {
				id
				body
				createdAt
				username
			}
		}
	}
`;

const FETCH_POST_QUERY = gql`
	query ($postId: ID!) {
		getPost(postId: $postId) {
			id
			body
			createdAt
			username
			likes {
				username
			}
			comments {
				id
				username
				createdAt
				body
			}
		}
	}
`;

export default SinglePost;
