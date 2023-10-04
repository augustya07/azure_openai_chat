import os
import streamlit as st
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS

import requests
from PyPDF2 import PdfReader
from langchain.text_splitter import CharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings, HuggingFaceInstructEmbeddings
from langchain.vectorstores import FAISS
# from langchain.chat_models import ChatOpenAI
from langchain.chat_models import AzureChatOpenAI
from langchain.prompts import PromptTemplate


from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
from htmlTemplates import css, bot_template, user_template
from langchain.llms import HuggingFaceHub
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate


app = Flask(__name__)
CORS(app)  

os.environ["OPENAI_API_TYPE"] = "azure"
os.environ["OPENAI_API_VERSION"] = "2023-05-15"
os.environ["OPENAI_API_BASE"] = "https://testpoc-embeddedada.openai.azure.com/"
os.environ["OPENAI_API_KEY"] = "f5bc81c8b3e84b1d8c693349cbe569de"

embeddings = OpenAIEmbeddings(
                deployment="Textembeddingpoc",
                model="text-embedding-ada-002",    
            )




def get_pdf_text(pdf_files):
    text = ""
    for pdf_file in pdf_files:
        try:
            pdf_reader = PdfReader(os.path.join("docs", pdf_file))
            for page in pdf_reader.pages:
                text += page.extract_text()
        except FileNotFoundError as e:
            raise FileNotFoundError(f"File not found: {pdf_file}") from e
    return text

def get_text_chunks(text):
    text_splitter = CharacterTextSplitter(
        separator="\n",
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    chunks = text_splitter.split_text(text)
    return chunks


def get_vectorstore(text_chunks):
    # embeddings = OpenAIEmbeddings()
    # embeddings = HuggingFaceInstructEmbeddings(model_name="hkunlp/instructor-xl")
    vectorstore = FAISS.from_texts(texts=text_chunks, embedding=embeddings)
    return vectorstore


# def get_conversation_chain(vectorstore):
#     llm = AzureChatOpenAI(deployment_name="Graph_AI", temperature=0, openai_api_version="2023-05-15")

#     # llm = HuggingFaceHub(repo_id="google/flan-t5-xxl", model_kwargs={"temperature":0.5, "max_length":512})
#     CONDENSE_QUESTION_PROMPT = PromptTemplate.from_template("""Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

#     Chat History:
#     {chat_history}
#     Follow Up Input: {question}
#     Standalone question:""")


#     qa_chain = RetrievalQA.from_chain_type(llm,retriever=vectorstore.as_retriever(),
#                                        return_source_documents=True)
    

#     result = qa_chain({"query": "what's the price of invoice"})
#     # print(len(result['source_documents']))
#     print(result)
#     result['source_documents'][0]

    # memory = ConversationBufferMemory(
    #     memory_key='chat_history', return_messages=True)
    # conversation_chain = ConversationalRetrievalChain.from_llm(
    #     llm=llm,
    #     retriever=vectorstore.as_retriever(),
    #     # return_source_documents=True,
    #     # condense_question_prompt=CONDENSE_QUESTION_PROMPT,

    #     memory=memory
    # )


    # return conversation_chain



def get_conversation_chain(vectorstore,question_prompt):
    llm = AzureChatOpenAI(deployment_name="Graph_AI", temperature=0, openai_api_version="2023-05-15")

    question = question_prompt
    # Create a prompt for the question
    # question_prompt = "What's the price of invoice?"

#     CONDENSE_QUESTION_PROMPT = ("""Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

# This should be in the following format:

# Question: [question here]
# Helpful Answer: [answer here]
# Score: [score between 0 and 100]

# Begin!

# Context:
# ---------
# {context}
# ---------
# Question: {question_prompt}
# Helpful Answer:""")

#     prompt = PromptTemplate(
#         template=CONDENSE_QUESTION_PROMPT, input_variables=["question_prompt"]
#     )

    # prompt = PromptTemplate(template=CONDENSE_QUESTION_PROMPT, in)

   

    # Retrieve the answer and source document


    # memory = ConversationBufferMemory(
    #     memory_key='chat_history', return_messages=True)
    
    # conversation_chain = ConversationalRetrievalChain.from_llm(
    #     llm=llm,
    #     retriever=vectorstore.as_retriever(),
    #     # condense_question_prompt=CONDENSE_QUESTION_PROMPT,

    #     memory=memory
    # )

    prompt_template = """Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

    {context}

    Question: {question}
    Answer: """
    PROMPT = PromptTemplate(
    template=prompt_template, input_variables=["context", "question"]
    )

    chain_type_kwargs = {"prompt": PROMPT}

    qa_chain = RetrievalQA.from_chain_type(
        llm,
        chain_type="stuff",
        retriever=vectorstore.as_retriever(),
        return_source_documents=True,
        chain_type_kwargs=chain_type_kwargs
    )
    
    # result = qa_chain(query=question_prompt)
    result = qa_chain({"query": question})
    



    if 'source_documents' in result and len(result['source_documents']) > 0:
        # Get the first source document
        source_doc = result['source_documents'][0]

        # Extract the answer
        answer = result['result']

        # Extract the source document's page content as a string
        source_doc_content = source_doc.page_content

        return answer, source_doc_content

    return None, None



def handle_userinput(user_question):
    response = {'question': user_question}
    return response







API_URL = "http://localhost/graph-api"  # Replace with your API URL


def download_files_from_api(api_url):
    # Make a request to the API URL
    response = requests.get(api_url)

    if response.status_code == 200:
        api_response = response.json()
        if "value" in api_response:
            if not os.path.exists("docs"):
                os.makedirs("docs")

            # Get a list of existing files in the "docs" folder
            existing_files = set(os.listdir("docs"))

            for item in api_response["value"]:
                download_url = item.get("@microsoft.graph.downloadUrl")
                filename = item.get("name")
                web_url = item.get("webUrl")  # Get the web URL

                if download_url and filename:
                    file_path = os.path.join("docs", filename)

                    # Make an API request to download the file
                    response = requests.get(download_url)

                    if response.status_code == 200:
                        with open(file_path, "wb") as f:
                            f.write(response.content)
                        print(f"Downloaded: {filename}")

                    # Remove the file from the existing_files set
                    existing_files.discard(filename)
                else:
                    print(f"Skipping item without download URL or filename: {item}")

            # Delete files that exist locally but are not in the API response
            for filename in existing_files:
                file_path = os.path.join("docs", filename)
                os.remove(file_path)
                print(f"Deleted local file: {filename}")

        else:
            print("API response does not contain 'value' field.")
    else:
        print(f"Failed to fetch data from API: {api_url}")


def list_files_in_docs_folder():
    if not os.path.exists("docs"):
        os.makedirs("docs")
    
    files = os.listdir("docs")
    return files



@app.route('/download_files', methods=['GET'])
def download_files():
    # Call the function to download files from the API URL
    download_files_from_api(API_URL)
    return jsonify({"message": "Files downloaded successfully"})
# Call the function with the API URL
# download_files_from_api(API_URL)

@app.route('/handle_userinput', methods=['POST'])
def process_data():

    data = request.json
    user_question = data.get('user_question')
    # get pdf text
    pdf_docs = list_files_in_docs_folder()

    raw_text = get_pdf_text(pdf_docs)

    # get the text chunks
    text_chunks = get_text_chunks(raw_text)

    # create vector store
    vectorstore = get_vectorstore(text_chunks)

    # create conversation chain
    # conversation_chain = get_conversation_chain(vectorstore)

    answer, source_document = get_conversation_chain(vectorstore,user_question)
    if answer is not None and source_document is not None:
        response = {
            "answer": answer,
            "source_document": source_document
        }
        return jsonify(response)
    else:
        return jsonify({"error": "Answer not found"}), 404  

    # return conversation_chain



# print(process_data("what's the price of invoice"))

# result = process_data(pdf_docs)
# print(handle_userinput("what's the price of invoice"))

if __name__ == '__main__':
    app.run(debug=True)