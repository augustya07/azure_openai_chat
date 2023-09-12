import os
import streamlit as st
from dotenv import load_dotenv
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


os.environ["OPENAI_API_TYPE"] = "azure"
os.environ["OPENAI_API_VERSION"] = "2023-05-15"
os.environ["OPENAI_API_BASE"] = "https://testpoc-embeddedada.openai.azure.com/"
os.environ["OPENAI_API_KEY"] = "f5bc81c8b3e84b1d8c693349cbe569de"

embeddings = OpenAIEmbeddings(
                deployment="Textembeddingpoc",
                model="text-embedding-ada-002",    
            )


def download_files(api_response):
    if not os.path.exists("docs"):
        os.makedirs("docs")
    
    for item in api_response["value"]:
        download_url = item.get("@microsoft.graph.downloadUrl")
        filename = item.get("name")
        
        if download_url and filename:
            file_path = os.path.join("docs", filename)
            
            # Make an API request to download the file
            response = requests.get(download_url)
            
            if response.status_code == 200:
                with open(file_path, "wb") as f:
                    f.write(response.content)
                # st.write(f"Downloaded: {filename}")
            else:
                st.error(f"Failed to download {filename}")


def list_files_in_docs_folder():
    if not os.path.exists("docs"):
        os.makedirs("docs")
    
    files = os.listdir("docs")
    return files


def call_api(api_url):
    headers = {
        "Content-Type": "application/json",
        # Add any other required headers here
    }

    # Make an HTTP GET request to the API
    try:
        response = requests.get(api_url, headers=headers)
        response.raise_for_status()  # Raise an error for bad status codes
        return response.json()
    except requests.exceptions.RequestException as e:
        st.error(f"API Request Error: {e}")
        return None




def get_pdf_text(pdf_files):
    text = ""
    for pdf_file in pdf_files:
        try:
            pdf_reader = PdfReader(os.path.join("docs", pdf_file))
            for page in pdf_reader.pages:
                text += page.extract_text()
        except FileNotFoundError:
            st.error(f"File not found: {pdf_file}")
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


def get_conversation_chain(vectorstore):
    llm = AzureChatOpenAI(deployment_name="Graph_AI", temperature=0, openai_api_version="2023-05-15")

    # llm = HuggingFaceHub(repo_id="google/flan-t5-xxl", model_kwargs={"temperature":0.5, "max_length":512})
    CONDENSE_QUESTION_PROMPT = PromptTemplate.from_template("""Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

    Chat History:
    {chat_history}
    Follow Up Input: {question}
    Standalone question:""")



    memory = ConversationBufferMemory(
        memory_key='chat_history', return_messages=True)
    conversation_chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=vectorstore.as_retriever(),
        # condense_question_prompt=CONDENSE_QUESTION_PROMPT,

        memory=memory
    )
    return conversation_chain


def handle_userinput(user_question):
    print('shit works')
    response = st.session_state.conversation({'question': user_question})
    print(user_question,'`````````````````')
    st.session_state.chat_history = response['chat_history']

    for i, message in enumerate(st.session_state.chat_history):
        if i % 2 == 0:
            st.write(user_template.replace(
                "{{MSG}}", message.content), unsafe_allow_html=True)
        else:
            st.write(bot_template.replace(
                "{{MSG}}", message.content), unsafe_allow_html=True)


def main():
    # load_dotenv()
    st.set_page_config(page_title="Azure",
                       )
    st.write(css, unsafe_allow_html=True)

    if "conversation" not in st.session_state:
        st.session_state.conversation = None
    if "chat_history" not in st.session_state:
        st.session_state.chat_history = None

    st.header("Azure Openai QnA")
    user_question = st.text_input("Ask a question about your documents:")
    if user_question:
        handle_userinput(user_question)

    with st.sidebar:
        st.subheader("Your documents")
        # pdf_docs = st.file_uploader(
        #     "Upload your PDFs here and click on 'Process'", accept_multiple_files=True)
        pdf_docs = list_files_in_docs_folder()
         # st.write(f"Downloaded: {filename}")
        st.write("Files in the Document Library")
        for filename in pdf_docs:
            st.write(f"- {filename}")

        if st.button("Process"):
            with st.spinner("Processing"):
                # get pdf text
                raw_text = get_pdf_text(pdf_docs)

                # get the text chunks
                text_chunks = get_text_chunks(raw_text)

                # create vector store
                vectorstore = get_vectorstore(text_chunks)

                # create conversation chain
                st.session_state.conversation = get_conversation_chain(
                    vectorstore)

    api_url = "http://172.178.101.76/graph-api"

    # Call the API and pass the response to download_files
    api_response = call_api(api_url)
    if api_response:
        download_files(api_response)

if __name__ == '__main__':
    main()
