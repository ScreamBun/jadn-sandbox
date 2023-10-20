import { NAV_EXTERNAL_OPENC2, NAV_EXTERNAL_OPENC2_FAQ, NAV_EXTERNAL_OPENC2_JADN_INFO_MODELING, NAV_EXTERNAL_OPENC2_JADN_PYPI, NAV_EXTERNAL_OPENC2_JADN_SPEC, NAV_EXTERNAL_OPENC2_JADN_SRC } from "components/utils/constants";
import React from "react"

const About = () => {
      return (
        <div className='card'>
          <div className='card-header p-2'>
            <h5 className='m-0'>About</h5>
          </div>
          <div className='card-body p-2'>

          <div className="row" >
              <div className='col-md-4'>
                <div id="list-example" className="list-group">
                  <a className="list-group-item list-group-item-action" href="#list-item-1">Item 1</a>
                  <a className="list-group-item list-group-item-action" href="#list-item-2">Item 2</a>
                  <a className="list-group-item list-group-item-action" href="#list-item-3">Item 3</a>
                  <a className="list-group-item list-group-item-action" href="#list-item-4">Item 4</a>
                </div>
              </div>
              <div className='col-md-8'>
                <div data-spy="scroll" data-target="#list-example" data-offset="0" className="scrollspy-example">
                  <h4 id="list-item-1">Item 1</h4>
                  <p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).</p>
                  <h4 id="list-item-2">Item 2</h4>
                  <p>There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.</p>
                  <h4 id="list-item-3">Item 3</h4>
                  <p>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.</p>
                  <h4 id="list-item-4">Item 4</h4>
                  <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
                </div>
              </div>
          </div>      

          <br/>        
          <br/>        

            <div className="row">
              <div className='col-md-12'>
                <p className='mt-2'>
                  The <b> JADN Sandbox </b> provides the ability to create, convert, translate, transform, and validate JADN compliant schemas.  
                  In addition, for applications that communicate via messaging, the app provides the ability to create and validate messages against a schema, as well as, 
                  generate test messages based on the provided schema.  Within JADN Sandbox users can interact with the JADN information modeling tools and create 
                  schemas or messages based on their application or systems needs or just to learn more about JADN with a hands on approach.  
                </p> 
              </div>
            </div>
            <div className="row">
              <div className='col-md-8 pr-1'>
                <ul className="list-group">
                    <li className="list-group-item active">
                      <b>FAQ</b>
                    </li>                    
                    <li className="list-group-item">
                      <p><b>What is JADN?</b></p>
                      <p>
                        JSON Abstract Data Notation (JADN) is an information modeling language.  It has several
                        purposes including defining data structures, validating data instances, informing user
                        interfaces working with structured data, and facilitating protocol internationalization.
                        JADN specifications consist of two parts:
                      </p>
                      <ol>
                        <li>Abstract type definitions that are independent
                          of data format. </li>
                        <li>Serialization rules that define how to represent type instances using
                          specific data formats. </li>
                      </ol> 
                    </li>
                    <li className="list-group-item">
                      <p><b>What is a Schema?</b></p>
                      <p>A Schema itself is a structured information object that can be
                      serialized and transferred between applications, documented in multiple formats such as text-based
                      interface definition languages, property tables or diagrams, and translated into concrete
                      schemas used to validate specific data formats.  A schema provides the guidelines for information or data used within a system. </p>
                    </li>
                    <li className="list-group-item">
                      <p><b>What is a JIDL?</b></p>
                      <p>JADN Interface Definition Language (IDL) is a textual representation of JADN type definitions" definition in the JADN spec.  
                        JIDL provides a human readable format of the JADN information model. 
                      </p>
                    </li>
                  </ul>                   
                </div>
                <div className='col-md-4 pl-1'>
                  <ul className="list-group">
                  <li className="list-group-item active">
                    <b>References</b>
                  </li>                 
                  <li className="list-group-item"><a href={NAV_EXTERNAL_OPENC2_JADN_SPEC} target='_blank' rel='noreferrer'>JADN Specification Doc</a></li>
                  <li className="list-group-item"><a href={NAV_EXTERNAL_OPENC2_JADN_INFO_MODELING} target='_blank' rel='noreferrer'>Information Modeling with JADN (work in progress)</a></li>
                  <li className="list-group-item"><a href={NAV_EXTERNAL_OPENC2_JADN_SRC} target='_blank' rel='noreferrer'>JADN Sandbox Source Code</a></li>
                  <li className="list-group-item"><a href={NAV_EXTERNAL_OPENC2_JADN_PYPI} target='_blank' rel='noreferrer'>JADN Python Package</a></li>
                  <li className="list-group-item"><a href={NAV_EXTERNAL_OPENC2} target='_blank' rel='noreferrer'>OpenC2</a>
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item">
                        <a href={NAV_EXTERNAL_OPENC2_FAQ} target='_blank' rel='noreferrer'>FAQ</a>
                      </li>
                    </ul>
                  </li>                 
                </ul>                  
              </div>                
            </div>           
          </div>                    
        </div>
      )
};
export default About;