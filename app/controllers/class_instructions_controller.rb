class ClassInstructionsController < ApplicationController
  # GET /class_instructions
  # GET /class_instructions.json
  def index
    @class_instructions = ClassInstruction.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @class_instructions }
    end
  end

  # GET /class_instructions/1
  # GET /class_instructions/1.json
  def show
    @class_instruction = ClassInstruction.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @class_instruction }
    end
  end

  # GET /class_instructions/new
  # GET /class_instructions/new.json
  def new
    @class_instruction = ClassInstruction.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @class_instruction }
    end
  end

  # GET /class_instructions/1/edit
  def edit
    @class_instruction = ClassInstruction.find(params[:id])
  end

  # POST /class_instructions
  # POST /class_instructions.json
  def create
    @class_instruction = ClassInstruction.new(params[:class_instruction])

    respond_to do |format|
      if @class_instruction.save
        format.html { redirect_to @class_instruction, notice: 'Class instruction was successfully created.' }
        format.json { render json: @class_instruction, status: :created, location: @class_instruction }
      else
        format.html { render action: "new" }
        format.json { render json: @class_instruction.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /class_instructions/1
  # PUT /class_instructions/1.json
  def update
    @class_instruction = ClassInstruction.find(params[:id])

    respond_to do |format|
      if @class_instruction.update_attributes(params[:class_instruction])
        format.html { redirect_to @class_instruction, notice: 'Class instruction was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @class_instruction.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /class_instructions/1
  # DELETE /class_instructions/1.json
  def destroy
    @class_instruction = ClassInstruction.find(params[:id])
    @class_instruction.destroy

    respond_to do |format|
      format.html { redirect_to class_instructions_url }
      format.json { head :no_content }
    end
  end
end
