module Api
  class TicketsController < BaseController
    def index
      service = Redmine::IssuesService.new(redmine_client)
      data = service.list(filter_params)
      render json: TicketSerializer.serialize_collection(data)
    end

    def show
      service = Redmine::IssuesService.new(redmine_client)
      data = service.find(params[:id])
      render json: { ticket: TicketDetailSerializer.serialize(data) }
    end

    def create
      service = Redmine::IssuesService.new(redmine_client)
      data = service.create(ticket_params)
      render json: { ticket: TicketSerializer.serialize(data["issue"]) }, status: :created
    end

    def update
      service = Redmine::IssuesService.new(redmine_client)
      service.update(params[:id], ticket_params)
      head :no_content
    end

    def destroy
      service = Redmine::IssuesService.new(redmine_client)
      service.destroy(params[:id])
      head :no_content
    end

    private

    def filter_params
      params.permit(:scope, :status_id, :project_id, :tracker_id,
                    :priority_id, :sort, :page, :per_page)
    end

    def ticket_params
      params.require(:ticket).permit(
        :subject, :description, :status_id, :priority_id, :tracker_id,
        :project_id, :assigned_to_id, :start_date, :due_date,
        :done_ratio, :estimated_hours, :parent_issue_id, :notes
      )
    end
  end
end
